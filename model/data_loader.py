import pandas as pd

class DataLoader:
    def __init__(self):
        self.users = None
        self.drivers = None
        self.orders = None
        self.reviews = None

    def load_data(self, users_path="data/mock_users.csv",
                  drivers_path="data/mock_drivers.csv",
                  orders_path="data/mock_orders.csv",
                  reviews_path="data/mock_reviews.csv"):
        self.users = pd.read_csv(users_path)
        self.drivers = pd.read_csv(drivers_path)
        self.orders = pd.read_csv(orders_path)
        self.reviews = pd.read_csv(reviews_path)
        print("所有数据已加载完成！")

    # 快速查询方法
    def get_user(self, user_id):
        return self.users[self.users['user_id'] == user_id].to_dict(orient='records')[0]

    def get_driver(self, driver_id):
        return self.drivers[self.drivers['driver_id'] == driver_id].to_dict(orient='records')[0]

    def get_order(self, order_id):
        return self.orders[self.orders['order_id'] == order_id].to_dict(orient='records')[0]

    def get_reviews_by_driver(self, driver_id):
        return self.reviews[self.reviews['driver_id'] == driver_id].to_dict(orient='records')

    def add_order(self, order: dict):
        """添加新订单到内存中的 orders"""
        import uuid
        order_id = str(uuid.uuid4())  # 自动生成唯一订单 ID
        self.orders[order_id] = order
        print(f"✅ 新增订单 {order_id} 已保存")
        return order_id