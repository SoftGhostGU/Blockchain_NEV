import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import TensorDataset, DataLoader
import numpy as np
import matplotlib.pyplot as plt
import os
from typing import Dict, Any

class MLP(nn.Module):
    def __init__(self, input_dim=8, hidden_dim=32, output_dim=50):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(input_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(),
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

        self.driver2idx = {did: i for i, did in enumerate(self.data_loader.drivers['driver_id'].tolist())}
        self.idx2driver = {i: did for did, i in self.driver2idx.items()}

    def _prepare_data(self, user_orders):
        X = user_orders[['user_credit','user_pref_quiet','user_pref_speed','user_pref_car_type',
                         'start_lat','start_lon','dest_lat','dest_lon']].values.astype(np.float32)
        y = np.array([self.driver2idx[did] for did in user_orders['driver_id']])
        return torch.tensor(X), torch.tensor(y, dtype=torch.long)

    def train_local_model(self, user_id, epochs=1, lr=0.01):
        user_orders = self.data_loader.orders[self.data_loader.orders['user_id'] == user_id]
        if len(user_orders) < 2:
            return None

        X, y = self._prepare_data(user_orders)
        loader = DataLoader(TensorDataset(X, y), batch_size=8, shuffle=True)

        model = MLP(output_dim=self.num_drivers).to(self.device)
        optimizer = optim.Adam(model.parameters(), lr=lr)
        criterion = nn.CrossEntropyLoss()

        model.train()
        user_losses = []
        for _ in range(epochs):
            batch_losses = []
            for xb, yb in loader:
                xb, yb = xb.to(self.device), yb.to(self.device)
                optimizer.zero_grad()
                logits = model(xb)
                loss = criterion(logits, yb)
                loss.backward()
                optimizer.step()
                batch_losses.append(loss.item())
            user_losses.append(np.mean(batch_losses))
        return model.state_dict(), user_losses

    def aggregate_global_model(self, local_weights_list):
        global_dict = {}
        for key in local_weights_list[0].keys():
            global_dict[key] = torch.mean(torch.stack([w[key] for w in local_weights_list]), dim=0)
        self.global_model.load_state_dict(global_dict)

    def train_federated(self, rounds=5, local_epochs=3, lr=0.01, save_plot=True):
        users = self.data_loader.users['user_id'].tolist()
        for uid in users:
            self.user_models[uid] = MLP(output_dim=self.num_drivers).to(self.device)
            self.user_models[uid].load_state_dict(self.global_model.state_dict())

        self.loss_history = []
        for r in range(rounds):
            round_losses = []
            local_weights = []
            for uid in users:
                result = self.train_local_model(uid, epochs=local_epochs, lr=lr)
                if result is None:
                    continue  # 🚨 跳过数据不足的用户
                state_dict, losses = result
                local_weights.append(state_dict)
                round_losses.append(np.mean(losses))
                self.user_models[uid].load_state_dict(state_dict)

            if local_weights:  # 至少有一个客户端参与
                self.aggregate_global_model(local_weights)
                for uid in users:
                    self.user_models[uid].load_state_dict(self.global_model.state_dict())

            avg_loss = np.mean(round_losses) if round_losses else 0
            print(f"[FedRound {r + 1}/{rounds}] 平均 loss: {avg_loss:.4f}")
            self.loss_history.append(avg_loss)

        if save_plot:
            self._plot_loss()

    def _plot_loss(self):
        plt.figure()
        plt.plot(range(1, len(self.loss_history)+1), self.loss_history, marker='o')
        plt.xlabel("Federated Round")
        plt.ylabel("Average Loss")
        plt.title("FedAvg Training Loss")
        os.makedirs("plots", exist_ok=True)
        plt.savefig("plots/fed_loss.png")
        plt.close()

    def predict_top5_drivers(self, order_info, top_k=5):
        """
        返回用户最可能选择的 top_k 司机列表
        """
        user_id = order_info['user_id']
        X = torch.tensor([[order_info['user_credit'], order_info['user_pref_quiet'],
                           order_info['user_pref_speed'], order_info['user_pref_car_type'],
                           order_info['start_lat'], order_info['start_lon'],
                           order_info['dest_lat'], order_info['dest_lon']]],
                         dtype=torch.float32).to(self.device)

        model = self.get_or_create_user_model(user_id)
        model.eval()

        with torch.no_grad():
            logits = model(X)
            probs = torch.softmax(logits, dim=1)  # 转为概率
            top_probs, top_idxs = torch.topk(probs, k=top_k, dim=1)

        top_driver_ids = [self.idx2driver[idx.item()] for idx in top_idxs[0]]
        top_scores = top_probs[0].cpu().numpy().tolist()

        # 返回列表 [(driver_id, score), ...]
        return list(zip(top_driver_ids, top_scores))

    def get_global_model_weights(self):
        """
        返回全局模型参数，字典形式，值为 list，可直接 JSON 传输
        """
        state_dict = self.global_model.state_dict()
        return {k: v.cpu().numpy().tolist() for k, v in state_dict.items()}

    def load_global_model(self, weights: Dict[str, Any]):
        """
        从服务器下发的参数更新全局模型
        """
        import torch
        state_dict = {k: torch.tensor(v) for k, v in weights.items()}
        self.global_model.load_state_dict(state_dict)

    def get_or_create_user_model(self, user_id: int):
        """
        获取用户模型，如果没有则创建并初始化
        """
        if user_id not in self.user_models:
            print(f"⚡ 初始化 user_id={user_id} 的模型")
            self.user_models[user_id] = MLP(output_dim=self.num_drivers).to(self.device)
            # 默认使用当前全局模型的参数初始化
            self.user_models[user_id].load_state_dict(self.global_model.state_dict())
        return self.user_models[user_id]
