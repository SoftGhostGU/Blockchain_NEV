from datetime import datetime
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import TensorDataset, DataLoader
import numpy as np
import matplotlib.pyplot as plt
import os
from typing import Dict, Any

class MLP(nn.Module):
    def __init__(self, input_dim=8, hidden_dim=256, output_dim=50):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(input_dim, hidden_dim),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(hidden_dim, output_dim)
        )

    def forward(self, x):
        return self.net(x)

class ModelManager:
    def __init__(self, data_loader):
        self.data_loader = data_loader
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.num_drivers = len(self.data_loader.drivers)
        self.user_models = {}
        self.global_model = MLP(output_dim=self.num_drivers).to(self.device)
        self.loss_history = []

        # driver <-> index 映射
        self.driver2idx = {did: i for i, did in enumerate(self.data_loader.drivers['driver_id'].tolist())}
        self.idx2driver = {i: did for did, i in self.driver2idx.items()}

        print(f"当前设备: {self.device}")

    def _prepare_data(self, user_orders):
        """准备 X, y 并标准化"""
        X = user_orders[['user_credit', 'user_pref_quiet', 'user_pref_speed', 'user_pref_car_type',
                         'start_lat', 'start_lon', 'dest_lat', 'dest_lon']].values.astype(np.float32)
        # 标准化
        X_mean = X.mean(axis=0)
        X_std = X.std(axis=0) + 1e-6
        X = (X - X_mean) / X_std
        y = np.array([self.driver2idx[did] for did in user_orders['driver_id']])
        return torch.tensor(X), torch.tensor(y, dtype=torch.long)

    def train_local_model(self, user_id, epochs=3, lr=0.001):
        user_orders = self.data_loader.orders[self.data_loader.orders['user_id'] == user_id]
        if len(user_orders) < 2:
            return None

        X, y = self._prepare_data(user_orders)
        loader = DataLoader(TensorDataset(X, y), batch_size=min(32, len(X)), shuffle=True)

        model = MLP(output_dim=self.num_drivers).to(self.device)
        model.load_state_dict(self.global_model.state_dict())  # 用全局模型初始化
        optimizer = optim.Adam(model.parameters(), lr=lr)
        criterion = nn.CrossEntropyLoss()

        epoch_losses = []
        model.train()
        for epoch in range(epochs):
            batch_losses = []
            for xb, yb in loader:
                xb, yb = xb.to(self.device), yb.to(self.device)
                optimizer.zero_grad()
                logits = model(xb)
                loss = criterion(logits, yb)
                loss.backward()
                optimizer.step()
                batch_losses.append(loss.item())
            epoch_losses.append(np.mean(batch_losses))

        return model.state_dict(), epoch_losses

    def aggregate_global_model(self, local_weights_list, local_sizes):
        """FedAvg 加权平均"""
        global_dict = {}
        total_samples = sum(local_sizes)
        for key in local_weights_list[0].keys():
            global_dict[key] = sum([w[key] * n for w, n in zip(local_weights_list, local_sizes)]) / total_samples
        self.global_model.load_state_dict(global_dict)
        # 同步所有用户模型
        for uid in self.user_models:
            self.user_models[uid].load_state_dict(self.global_model.state_dict())

    def train_federated(self, rounds=5, local_epochs=3, lr=0.01, save_plot=True):
        users = self.data_loader.users['user_id'].tolist()
        # 初始化每个用户模型
        for uid in users:
            self.user_models[uid] = MLP(output_dim=self.num_drivers).to(self.device)
            self.user_models[uid].load_state_dict(self.global_model.state_dict())

        self.loss_history = []
        for r in range(rounds):
            round_losses = []
            local_weights = []
            local_sizes = []
            for uid in users:
                result = self.train_local_model(uid, epochs=local_epochs, lr=lr)
                if result is None:
                    continue
                state_dict, losses = result
                local_weights.append(state_dict)
                local_sizes.append(len(self.data_loader.orders[self.data_loader.orders['user_id'] == uid]))
                round_losses.append(np.mean(losses))
                self.user_models[uid].load_state_dict(state_dict)

            if local_weights:
                self.aggregate_global_model(local_weights, local_sizes)

            avg_loss = np.mean(round_losses) if round_losses else 0
            print(f"[FedRound {r + 1}/{rounds}] 平均 loss: {avg_loss:.4f}")
            self.loss_history.append(avg_loss)

        if save_plot:
            self._plot_loss()

    def _plot_loss(self):
        time = datetime.now().strftime("%Y%m%d")
        plt.figure()
        plt.plot(range(1, len(self.loss_history)+1), self.loss_history, marker='o')
        plt.xlabel("Federated Round")
        plt.ylabel("Average Loss")
        plt.title("FedAvg Training Loss")
        os.makedirs("plots", exist_ok=True)
        plt.savefig(f"plots/fed_loss_{time}.png")
        plt.close()

    def predict_top5_drivers(self, order_info, top_k=5):
        user_id = order_info['user_id']
        X = torch.tensor([[order_info['user_credit'], order_info['user_pref_quiet'],
                           order_info['user_pref_speed'], order_info['user_pref_car_type'],
                           order_info['start_lat'], order_info['start_lon'],
                           order_info['dest_lat'], order_info['dest_lon']]], dtype=torch.float32).to(self.device)

        model = self.get_or_create_user_model(user_id)
        model.eval()
        with torch.no_grad():
            logits = model(X)
            probs = torch.softmax(logits, dim=1)
            top_probs, top_idxs = torch.topk(probs, k=top_k, dim=1)

        top_driver_ids = [self.idx2driver[idx.item()] for idx in top_idxs[0]]
        top_scores = top_probs[0].cpu().numpy().tolist()
        return list(zip(top_driver_ids, top_scores))

    def get_or_create_user_model(self, user_id: int):
        if user_id not in self.user_models:
            self.user_models[user_id] = MLP(output_dim=self.num_drivers).to(self.device)
            self.user_models[user_id].load_state_dict(self.global_model.state_dict())
        return self.user_models[user_id]

    def get_global_model_weights(self):
        state_dict = self.global_model.state_dict()
        return {k: v.cpu().numpy().tolist() for k, v in state_dict.items()}

    def load_global_model(self, weights: Dict[str, Any]):
        state_dict = {k: torch.tensor(v, device=self.device) for k, v in weights.items()}
        self.global_model.load_state_dict(state_dict)
        for uid in self.user_models:
            self.user_models[uid].load_state_dict(self.global_model.state_dict())