import pandas as pd
import numpy as np

NUM_USERS = 500

users = pd.DataFrame({
    "user_id": np.arange(1, NUM_USERS + 1),
    "username": [f"user{i}" for i in range(1, NUM_USERS + 1)],
    "user_credit": np.random.randint(50, 101, NUM_USERS),
    "pref_quiet": np.random.randint(0, 2, NUM_USERS),
    "pref_speed": np.random.randint(0, 2, NUM_USERS),
    "pref_car_type": np.random.randint(1, 5, NUM_USERS)
})

users.to_csv("mock_users.csv", index=False)
print("用户数据已生成: mock_users.csv")
