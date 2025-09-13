import pandas as pd
import numpy as np

NUM_DRIVERS = 500

# 上海大致经纬度范围
LAT_RANGE = (31.2, 31.4)
LON_RANGE = (121.3, 121.5)

drivers = pd.DataFrame({
    "driver_id": np.arange(1, NUM_DRIVERS + 1),
    "driver_credit": np.random.randint(50, 101, NUM_DRIVERS),
    "driver_service_quality": np.random.randint(1, 6, NUM_DRIVERS),
    "driver_car_cleanliness": np.random.randint(1, 6, NUM_DRIVERS),
    "driver_punctuality": np.random.randint(1, 6, NUM_DRIVERS),
    "driver_car_type": np.random.randint(1, 5, NUM_DRIVERS),
    "driver_rating_avg": np.round(np.random.uniform(3.0, 5.0, NUM_DRIVERS), 2),
    "driver_order_count": np.random.randint(0, 500, NUM_DRIVERS),
    "lat": np.round(np.random.uniform(*LAT_RANGE, NUM_DRIVERS), 6),
    "lon": np.round(np.random.uniform(*LON_RANGE, NUM_DRIVERS), 6)
})

drivers.to_csv("mock_drivers.csv", index=False)
print("司机数据已生成: mock_drivers.csv")
