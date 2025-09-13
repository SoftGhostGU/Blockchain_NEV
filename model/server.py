from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any
import logging
import numpy as np
import copy

app = FastAPI(title="Federated Learning Server")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# -------------------- 模型存储 --------------------
global_model: Dict[str, Any] = {}  # 全局模型
model_updates: list[Dict[str, Any]] = []  # 存放各客户端上传的权重列表

# 请求数据模型
class ModelUpload(BaseModel):
    weights: Dict[str, Any]

@app.post("/upload_model")
def upload_model(data: ModelUpload):
    global model_updates, global_model
    try:
        if not isinstance(data.weights, dict):
            return {"status": "error", "message": "上传模型格式必须是 dict"}

        # 保存上传的模型
        model_updates.append(data.weights)
        logger.info(f"收到客户端模型更新, 总更新数={len(model_updates)}")

        # 聚合全局模型
        if model_updates:
            new_state = {}
            for key in model_updates[0].keys():
                # 把每个权重转为 numpy array 再平均
                arrs = [np.array(w[key]) for w in model_updates]
                new_state[key] = (np.mean(arrs, axis=0)).tolist()
            global_model = new_state

        return {"status": "ok", "message": f"Received update. Total = {len(model_updates)}"}

    except Exception as e:
        logger.exception("聚合模型时出错")
        return {"status": "error", "message": str(e)}

@app.get("/get_global_model")
def get_global_model_weights():
    if not global_model:
        return {"status": "error", "message": "Global model未初始化"}
    return {"status": "ok", "weights": global_model}

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "Federated server running"}
