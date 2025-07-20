import '../../../style/orderManage.scss'

import { Rate } from 'antd';

interface OrderCardProps {
  data: {
    orderId: string,
    orderTime: string,
    orderType: string,
    balance: string,
    status: string,
    startLocation: string,
    endLocation: string,
    userAvatar: string,
    username: string,
    commentStar: number,
    commentText: string,
  }
}

export default function OrderCard(data: OrderCardProps) {
  // const data = {
  //   orderId: 'ORD20250717001',
  //   orderTime: '2025-07-17 10:00:00',
  //   orderType: '网约车',
  //   balance: '+￥180',
  //   status: '已完成',
  //   // operate: '· · ·'
  //   startLocation: '北京市朝阳区三里屯',
  //   endLocation: '北京市海淀区中关村',
  //   userAvatar: 'https://s21.ax1x.com/2025/04/24/pEoUQMD.jpg',
  //   username: '张俊喆',
  //   commentStar: 0.5,
  //   commentText: '非常差劲，车子开得太快了，路上堵车，还不及时让行，要价高，简直黑车！投诉！终身静止使用这个平台！',
  // }

  return (
    <div className="order-card">
      <div className="card-header">
        <div className="order-id">{data.data.orderId}</div>
        <div className="order-time">{data.data.orderTime}</div>
      </div>

      <div className="route-info">
        <div className="location">
          <div className="location-dot start"></div>
          <div className="location-text">{data.data.startLocation}</div>
        </div>
        <div className="location">
          <div className="location-dot end"></div>
          <div className="location-text">{data.data.endLocation}</div>
        </div>
      </div>

      <div className="user-comment">
        <div>
          <img
            src={data.data.userAvatar}
            alt="用户头像"
            className='user-avatar'
          />
        </div>
        <div className='comment-container'>
          <div className="user-info">
            <span className="username">{data.data.username}</span>
            <Rate
              style={{ fontSize: '14px' }}
              disabled
              allowHalf
              defaultValue={data.data.commentStar}
            />
          </div>
          <div className="comment-text">{data.data.commentText}</div>
        </div>
      </div>

      <div className="card-footer">
        <div className={`status ${data.data.status === '已完成' ? 'completed' : ''}`}>
          {data.data.status}
        </div>
        <div className="price">{data.data.balance}</div>
      </div>
    </div>
  );
}