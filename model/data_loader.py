import pandas as pd
from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()  # 加载 .env 文件

class DataLoader:
    def __init__(self):
        """
        db_url 示例:
        mysql+pymysql://用户名:密码@主机:端口/数据库名
        """
        user = os.getenv("DB_USER")
        password = os.getenv("DB_PASSWORD")
        host = os.getenv("DB_HOST", "127.0.0.1")
        port = os.getenv("DB_PORT", "3306")
        db = os.getenv("DB_NAME")

        db_url = f"mysql+pymysql://{user}:{password}@{host}:{port}/{db}"
        self.engine = create_engine(db_url)

        self.users = None
        self.drivers = None
        self.orders = None
        self.reviews = None

    def load_data(self):
        """从数据库加载所有表"""
        self.users = pd.read_sql("SELECT * FROM users", self.engine)
        self.drivers = pd.read_sql("SELECT * FROM drivers", self.engine)
        query = """
                SELECT o.user_id,
                       u.credit_score          AS user_credit,
                       u.quiet_preference      AS user_pref_quiet,
                       u.speed_preference      AS user_pref_speed,
                       u.preferred_car_type    AS user_pref_car_type,
                       o.origin_latitude       AS start_lat,
                       o.origin_longitude      AS start_lon,
                       o.destination_latitude  AS dest_lat,
                       o.destination_longitude AS dest_lon,
                       o.driver_id             AS driver_id
                FROM orders o
                         JOIN users u ON o.user_id = u.user_id
                """
        self.user_orders = pd.read_sql(query, self.engine)

        self.reviews = pd.read_sql("SELECT * FROM reviews", self.engine)
        print("✅ 所有数据已从数据库加载完成！")

    # ---------------- 快速查询方法 ----------------
    def get_user(self, user_id):
        query = text("SELECT * FROM users WHERE user_id = :uid")
        result = pd.read_sql(query, self.engine, params={"uid": user_id})
        return result.to_dict(orient="records")[0] if not result.empty else None

    def get_driver(self, driver_id):
        query = text("SELECT * FROM drivers WHERE driver_id = :did")
        result = pd.read_sql(query, self.engine, params={"did": driver_id})
        return result.to_dict(orient="records")[0] if not result.empty else None

    def get_order(self, order_id):
        query = text("SELECT * FROM orders WHERE order_id = :oid")
        result = pd.read_sql(query, self.engine, params={"oid": order_id})
        return result.to_dict(orient="records")[0] if not result.empty else None

    def get_reviews_by_driver(self, driver_id):
        query = text("SELECT * FROM reviews WHERE driver_id = :did")
        result = pd.read_sql(query, self.engine, params={"did": driver_id})
        return result.to_dict(orient="records")

    # ---------------- 写操作 ----------------
    def add_order(self, order: dict):
        """向数据库添加新订单"""
        import uuid
        order_id = str(uuid.uuid4())
        order["order_id"] = order_id
        with self.engine.begin() as conn:
            cols = ", ".join(order.keys())
            vals = ", ".join([f":{k}" for k in order.keys()])
            sql = text(f"INSERT INTO orders ({cols}) VALUES ({vals})")
            conn.execute(sql, order)
        print(f"✅ 新增订单 {order_id} 已保存到数据库")
        return order_id
