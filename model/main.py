from datetime import datetime

from fastapi import FastAPI
from fastapi.responses import FileResponse
from pydantic import BaseModel
from data_loader import DataLoader
from model_manager import ModelManager
import logging
import requests
from typing import List

app = FastAPI(title="去中心化打车平台模型服务")

data_loader = DataLoader()
data_loader.load_data()
model_manager = ModelManager(data_loader)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# -------------------- 联邦服务器 --------------------
FED_SERVER_URL = "http://127.0.0.1:5000"

def update_global_model_from_server():
    try:
        resp = requests.get(f"{FED_SERVER_URL}/get_global_model")
        r = resp.json()
        if r.get("status") == "ok" and "weights" in r:
            weights = r["weights"]
            model_manager.load_global_model(weights)
            logger.info("成功加载服务器全局模型")
        else:
            logger.warning("服务器全局模型未准备好")
    except Exception as e:
        logger.error(f"获取服务器模型失败: {e}")

update_global_model_from_server()

# -------------------- 健康检查 --------------------
@app.get("/health")
def health_check():
    return {"status": "ok", "message": "模型服务运行正常"}

# -------------------- 查询接口 --------------------
@app.get("/user/{user_id}")
def get_user(user_id: int):
    try:
        user = data_loader.get_user(user_id)
        return {"status": "ok", "user": user}
    except:
        return {"status": "error", "message": f"未找到 user_id={user_id}"}

@app.get("/driver/{driver_id}")
def get_driver(driver_id: int):
    try:
        driver = data_loader.get_driver(driver_id)
        return {"status": "ok", "driver": driver}
    except:
        return {"status": "error", "message": f"未找到 driver_id={driver_id}"}

@app.get("/order/{order_id}")
def get_order(order_id: str):
    try:
        order = data_loader.get_order(order_id)
        return {"status": "ok", "order": order}
    except:
        return {"status": "error", "message": f"未找到 order_id={order_id}"}

@app.get("/driver/{driver_id}/reviews")
def get_driver_reviews(driver_id: int):
    reviews = data_loader.get_reviews_by_driver(driver_id)
    return {"status": "ok", "reviews": reviews}

# -------------------- POST 接口 --------------------
class PredictInput(BaseModel):
    user_id: int
    user_credit: int
    user_pref_quiet: int
    user_pref_speed: int
    user_pref_car_type: int
    start_lat: float
    start_lon: float
    dest_lat: float
    dest_lon: float

class DriverScore(BaseModel):
    driver_id: int
    score: float

class PredictOutputTop5(BaseModel):
    status: str
    top_drivers: List[DriverScore]

class PredictOutput(BaseModel):
    status: str
    recommended_driver_id: int

@app.post("/predict", response_model=PredictOutput)
def predict_driver(input_data: PredictInput):
    logger.info("----- 开始预测 -----")
    update_global_model_from_server()
    top5_list = model_manager.predict_top5_drivers(input_data.dict(), top_k=5)
    # 返回第一个司机 ID
    recommended_driver_id = top5_list[0][0]
    return {"status": "ok", "recommended_driver_id": recommended_driver_id}

@app.post("/predict_top5", response_model=PredictOutputTop5)
def predict_driver_top5(input_data: PredictInput):
    logger.info("----- 开始 Top5 预测 -----")
    update_global_model_from_server()
    top5_list = model_manager.predict_top5_drivers(input_data.dict(), top_k=5)
    # 转换成字典列表用于返回
    top5_dict_list = [{"driver_id": did, "score": score} for did, score in top5_list]
    return {"status": "ok", "top_drivers": top5_dict_list}

# -------------------- 训练接口 --------------------
class CompleteOrderInput(BaseModel):
    user_id: int
    driver_id: int
    user_credit: int
    user_pref_quiet: int
    user_pref_speed: int
    user_pref_car_type: int
    start_lat: float
    start_lon: float
    dest_lat: float
    dest_lon: float


class CompleteOrderOutput(BaseModel):
    status: str
    message: str


@app.post("/complete_order", response_model=CompleteOrderOutput)
def complete_order(order: CompleteOrderInput):
    logger.info(f"----- 用户 {order.user_id} 完成订单，更新本地模型 -----")

    # 1️⃣ 将订单加入本地数据
    data_loader.add_order({
        "user_id": order.user_id,
        "driver_id": order.driver_id,
        "user_credit": order.user_credit,
        "user_pref_quiet": order.user_pref_quiet,
        "user_pref_speed": order.user_pref_speed,
        "user_pref_car_type": order.user_pref_car_type,
        "start_lat": order.start_lat,
        "start_lon": order.start_lon,
        "dest_lat": order.dest_lat,
        "dest_lon": order.dest_lon
    })

    # 2️⃣ 更新本地模型
    result = model_manager.train_local_model(order.user_id, epochs=1, lr=0.01)
    if result is None:
        return {"status": "error", "message": "用户订单数据不足，无法更新模型"}

    state_dict, losses = result
    user_model = model_manager.get_or_create_user_model(order.user_id)
    user_model.load_state_dict(state_dict)

    return {"status": "ok", "message": "本地模型已更新"}


# -------------------- 返回训练 loss 图 --------------------
@app.get("/train_loss_plot")
def train_loss_plot():
    time = datetime.now().strftime("%Y%m%d")
    return FileResponse(f"plots/fed_loss_{time}.png")

# -------------------- 打印路由检查 --------------------
logger.info("FastAPI app loaded, routes:")
for route in app.routes:
    logger.info(f"    {route.path} {route.methods}")
