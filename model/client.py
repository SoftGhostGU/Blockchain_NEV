import requests
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from data_loader import DataLoader
from model_manager import ModelManager

FED_SERVER_URL = "http://127.0.0.1:5000"  # server 地址

# -------------------- 初始化本地数据和模型 --------------------
data_loader = DataLoader()
data_loader.load_data()
model_manager = ModelManager(data_loader)

# -------------------- 训练本地模型 --------------------
model_manager.train_federated(rounds=100, local_epochs=5)

# -------------------- 获取本地全局模型权重 --------------------
weights = model_manager.get_global_model_weights()  # dict of list

# -------------------- 上传全局模型权重到服务器 --------------------
resp = requests.post(f"{FED_SERVER_URL}/upload_model", json={"weights": weights})

try:
    print(resp.json())
except Exception as e:
    print("上传返回非 JSON:", resp.text)
    print("错误:", e)


