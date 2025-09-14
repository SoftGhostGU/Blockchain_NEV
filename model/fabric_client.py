import requests
import json
from datetime import datetime

FABRIC_API_URL = "http://fabric-api-server"  # 替换成你的 Fabric 网关 URL

def submit_model(model_id: str, client_id: str, round: int, weights: list):
    """
    上传模型参数到 Fabric
    """
    url = f"{FABRIC_API_URL}/submit_model"
    payload = {
        "modelID": model_id,
        "clientID": client_id,
        "round": round,
        "weights": json.dumps(weights),
        "timestamp": datetime.utcnow().isoformat()
    }
    response = requests.post(url, json=payload)
    if response.status_code == 200:
        print(f"[Fabric] Model {model_id} uploaded successfully.")
        return True
    else:
        print(f"[Fabric] Failed to upload model: {response.text}")
        return False


def aggregate_models(round: int):
    """
    触发 Fabric 上链聚合同一轮次模型
    返回聚合后的全局模型参数 JSON
    """
    url = f"{FABRIC_API_URL}/aggregate_models"
    payload = {"round": round}
    response = requests.post(url, json=payload)
    if response.status_code == 200:
        print(f"[Fabric] Aggregated global model for round {round}.")
        return response.json()
    else:
        print(f"[Fabric] Failed to aggregate models: {response.text}")
        return None


def query_model(model_id: str):
    """
    查询单个模型
    """
    url = f"{FABRIC_API_URL}/query_model"
    params = {"modelID": model_id}
    response = requests.get(url, params=params)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"[Fabric] Failed to query model {model_id}: {response.text}")
        return None


def query_client_models(client_id: str):
    """
    查询某客户端的所有模型
    """
    url = f"{FABRIC_API_URL}/query_client_models"
    params = {"clientID": client_id}
    response = requests.get(url, params=params)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"[Fabric] Failed to query client {client_id} models: {response.text}")
        return None


def model_exists(model_id: str):
    """
    判断模型是否存在
    """
    url = f"{FABRIC_API_URL}/model_exists"
    params = {"modelID": model_id}
    response = requests.get(url, params=params)
    if response.status_code == 200:
        return response.json().get("exists", False)
    else:
        print(f"[Fabric] Failed to check model {model_id}: {response.text}")
        return False



# # 使用示例：
# from fabric_client import submit_model, aggregate_models, query_model
#
# # 上传模型
# weights = [0.1, 0.2, 0.3, 0.4]
# submit_model("model_001", "client_01", 1, weights)
#
# # 聚合模型
# global_model = aggregate_models(1)
# print(global_model)
#
# # 查询单个模型
# model = query_model("model_001")
# print(model)
