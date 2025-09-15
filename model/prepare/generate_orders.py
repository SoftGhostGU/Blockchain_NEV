import pandas as pd
import numpy as np
import torch
from torch.utils.data import DataLoader, TensorDataset

# -------------------- 用户和司机数据 --------------------
drivers = pd.read_csv("../data/mock_drivers.csv")
users = pd.read_csv("../data/mock_users.csv")

NUM_ORDERS = 1000
LAT_START_RANGE = (31.2, 31.4)
LON_START_RANGE = (121.3, 121.5)
LAT_END_RANGE = (31.2, 31.4)
LON_END_RANGE = (121.3, 121.5)

orders_list = []

def generate_order(order_id, user):
    start_lat = round(np.random.uniform(*LAT_START_RANGE), 6)
    start_lon = round(np.random.uniform(*LON_START_RANGE), 6)
    dest_lat = round(np.random.uniform(*LAT_END_RANGE), 6)
    dest_lon = round(np.random.uniform(*LON_END_RANGE), 6)
    time_slot = np.random.randint(0, 24)

    # ------------------ 模拟匹配司机 ------------------
    driver_scores = []
    for _, driver in drivers.iterrows():
        score_pref = 0
        if user["pref_quiet"] == 1 and driver["driver_service_quality"] >= 4:
            score_pref += 1
        if user["pref_speed"] == 1 and driver["driver_punctuality"] >= 4:
            score_pref += 1
        if user["pref_car_type"] == driver["driver_car_type"]:
            score_pref += 1

        distance = ((driver["lat"] - start_lat) ** 2 + (driver["lon"] - start_lon) ** 2) ** 0.5
        score_distance = 1 / (distance + 0.001)

        score_credit = driver["driver_credit"] / 100
        total_score = 0.5 * score_pref + 0.3 * score_distance + 0.2 * score_credit
        driver_scores.append((driver["driver_id"], total_score))

    # 选出得分最高的司机
    matched_driver_id = max(driver_scores, key=lambda x: x[1])[0]

    return {
        "order_id": f"ORD{order_id:05d}",
        "user_id": user["user_id"],
        "driver_id": matched_driver_id,
        "user_credit": user["user_credit"],
        "user_pref_quiet": user["pref_quiet"],
        "user_pref_speed": user["pref_speed"],
        "user_pref_car_type": user["pref_car_type"],
        "start_lat": start_lat,
        "start_lon": start_lon,
        "dest_lat": dest_lat,
        "dest_lon": dest_lon
    }

# ---------------- 生成订单 ----------------
order_id = 1
for _, user in users.iterrows():
    for _ in range(3):
        orders_list.append(generate_order(order_id, user))
        order_id += 1

remaining_orders = NUM_ORDERS - len(orders_list)
for _ in range(remaining_orders):
    user_idx = np.random.randint(0, len(users))
    orders_list.append(generate_order(order_id, users.loc[user_idx]))
    order_id += 1

orders = pd.DataFrame(orders_list)
orders.to_csv("mock_orders.csv", index=False)
print("✅ 订单数据已生成: mock_orders.csv")
