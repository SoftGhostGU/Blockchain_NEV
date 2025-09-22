复制.env.example为.env，并根据实际情况修改相应参数

```shell
uvicorn server:app --reload --host 127.0.0.1 --port 5000
python client.py
uvicorn main:app --reload --host 127.0.0.1 --port 8000 --log-level debug
```

http://127.0.0.1:8000
- GET /health → 服务是否启动`{"status":"ok","message":"模型服务运行正常"}`
- GET /user/1 → 查询用户信息
- GET /driver/2 → 查询司机信息
- GET /order/ORD001 → 查询订单信息
- GET /driver/1/reviews → 查询司机评论
- POST /predict_top5 → 预测用户的top5推荐司机
- POST /complete_order → 完成订单，并更新本地模型
- GET /train_loss_plot → 训练过程中的loss曲线图