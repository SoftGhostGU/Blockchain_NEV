import pandas as pd
import numpy as np

# 读取订单数据（已经包含匹配的 driver_id）
orders = pd.read_csv("../data/mock_orders.csv")
NUM_REVIEWS = len(orders)

np.random.seed(42)

# 评价短语池
phrases = [
    "很满意", "服务不错", "车很干净", "司机很礼貌",
    "等待时间长", "速度快", "比较安静", "车内有异味", "驾驶稳", "态度一般"
]

reviews_list = []
for i in range(1, NUM_REVIEWS + 1):
    order = orders.loc[i - 1]
    num_phrases = np.random.randint(1, 4)  # 每条评论拼接1~3个短语
    content = "，".join(np.random.choice(phrases, num_phrases, replace=False))

    reviews_list.append({
        "review_id": i,
        "order_id": order["order_id"],
        "user_id": order["user_id"],
        "driver_id": order["driver_id"],  # 确保评论对应匹配司机
        "content": content,
        "comment_star": np.random.randint(3, 6)  # 3~5星随机
    })

reviews = pd.DataFrame(reviews_list)
reviews.to_csv("mock_reviews.csv", index=False)
print("评论数据已生成（对应匹配司机，随机拼接短语）: mock_reviews.csv")
