from datetime import datetime

import torch
import pandas as pd

if_cuda = torch.cuda.is_available()
print("if_cuda=",if_cuda)
gpu_count = torch.cuda.device_count()
print("gpu_count=",gpu_count)

# df = pd.read_csv("./data/mock_drivers.csv")
# cols = [col for col in df.columns if col not in ['driver_id', 'driver_car_cleanliness', 'driver_car_type', 'lat', 'lon']]
# for i in range(df.shape[0]):
#     # 补全电话号码的后三位为三位数，不足三位的前面补零
#     phone_number = f"138123456{str(i + 1).zfill(3)}"
#
#     row_str = ', '.join([f"{df.iloc[i][col]}" for col in cols])
#     row = "INSERT INTO drivers (username,password,phone,credit_score,driver_service_quality,driver_punctuality,driver_rating_avg,driver_order_count) VALUES (\'driver_" + str(
#         i) + "\',\'driver_" + str(i) + "\',\'" + phone_number + "\'," + row_str + ");"
#     print(row)

# df = pd.read_csv("./data/mock_users.csv")
# cols = [col for col in df.columns if col not in ['user_id', 'username']]
# for i in range(df.shape[0]):
#     # 补全电话号码的后三位为三位数，不足三位的前面补零
#     phone_number = f"138123456{str(i + 1).zfill(3)}"
#
#     row_str = ', '.join([f"{df.iloc[i][col]}" for col in cols])
#     row = "INSERT INTO users (username,password,phone,credit_score,pref_quiet,pref_speed,pref_car_type) VALUES (\'user" + str(i) + "\',\'user" + str(i) + "\',\'" + phone_number + "\'," + row_str + ");"
#     print(row)


# 读取你的订单 CSV
df = pd.read_csv("./data/mock_orders.csv")

# 你 CSV 里缺少的字段，我这里做一些默认值/随机值的补全
def gen_sql():
    sqls = []
    for i in range(df.shape[0]):
        order_id = df.iloc[i]["order_id"]
        user_id = int(df.iloc[i]["user_id"])
        driver_id = int(df.iloc[i]["driver_id"])
        vehicle_id = 1000 + i  # 假设车辆 ID = 1000+i
        start_lat = df.iloc[i]["start_lat"]
        start_lon = df.iloc[i]["start_lon"]
        dest_lat = df.iloc[i]["dest_lat"]
        dest_lon = df.iloc[i]["dest_lon"]

        # 人性化的地名（这里简单用坐标拼接，你也可以改成真实地址）
        start_location = f"({start_lat},{start_lon})"
        destination = f"({dest_lat},{dest_lon})"

        # 状态 / 价格 / 时间 生成一些默认值
        status = 0  # 默认待支付
        estimated_price = round(30 + i * 2.5, 2)   # 模拟一个预估价格
        actual_price = estimated_price + 1         # 模拟实际价格
        order_type = "快车" if i % 2 == 0 else "专车"
        created_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        updated_at = created_at
        estimated_time = 25 + i * 3
        actual_time = estimated_time + 2
        access_policy = "policy_A" if i % 2 == 0 else "policy_B"

        # 用户相关
        user_credit = int(df.iloc[i]["user_credit"])
        user_pref_quiet = int(df.iloc[i]["user_pref_quiet"])
        user_pref_speed = int(df.iloc[i]["user_pref_speed"])
        user_pref_car_type = int(df.iloc[i]["user_pref_car_type"])

        # 拼接 SQL
        row = f"""INSERT INTO orders 
(order_id,user_id,driver_id,vehicle_id,start_location,destination,status,estimated_price,actual_price,type,created_at,updated_at,estimated_time,actual_time,access_policy,user_credit,user_pref_quiet,user_pref_speed,user_pref_car_type,start_lat,start_lon,dest_lat,dest_lon) 
VALUES ('{order_id}',{user_id},{driver_id},{vehicle_id},'{start_location}','{destination}',{status},{estimated_price},{actual_price},'{order_type}','{created_at}','{updated_at}',{estimated_time},{actual_time},'{access_policy}',{user_credit},{user_pref_quiet},{user_pref_speed},{user_pref_car_type},{start_lat},{start_lon},{dest_lat},{dest_lon});"""
        sqls.append(row)
    return sqls

# 生成并打印
for s in gen_sql():
    print(s)
