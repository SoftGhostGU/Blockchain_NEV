import React, { useEffect } from 'react';
import './index.scss';
import { useColorModeStore } from '../../store/store';

interface Order {
  orderId: string;
  orderTime: string;
  orderType: string;
  balance: string;
  status: string;         // '已完成' | '进行中' | '失败' ...
  startLocation: string;
  endLocation: string;
}

interface NotificationTooltipProps {
  orders?: Order[];
}

const NotificationTooltip: React.FC<NotificationTooltipProps> = ({ orders = [] }) => {
  const length = orders.length;
  const maxShow = 3;
  const showOrders = length > maxShow? orders.slice(0, maxShow) : orders;

  const isNightMode = useColorModeStore((state) => state.isNightMode);

  useEffect(() => {
    const notifItem = document.querySelectorAll('.notif-item');
    const head = document.querySelectorAll('.head');
    const text = document.querySelectorAll('.text');
    const notifMore = document.querySelector('.notif-more');
    if (isNightMode) {
      notifItem.forEach((item) => {item.classList.add('night-mode')});
      head.forEach((item) => {item.classList.add('night-mode')});
      text.forEach((item) => {item.classList.add('night-mode')});
      notifMore?.classList.add('night-mode');
    } else {
      notifItem.forEach((item) => {item.classList.remove('night-mode')});
      head.forEach((item) => {item.classList.remove('night-mode')});
      text.forEach((item) => {item.classList.remove('night-mode')});
      notifMore?.classList.remove('night-mode');
    }
  }, [isNightMode])

  if (!orders.length) {
    return <div className="notif-tooltip">暂无新的通知</div>;
  }

  return (
    <div className="notif-tooltip">
      <div className="notif-title">新订单通知</div>
      <div className="notif-list">
        {showOrders.map((o) => (
          <div className="notif-item" key={o.orderId}>
            <div className="row head">
              <span className="order-id">#{o.orderId}</span>
              <span className="order-time">{o.orderTime}</span>
            </div>
            <div className="row route">
              <span className="text">{o.startLocation} → {o.endLocation}</span>
            </div>
            <div className="row foot">
              <span className={`status ${o.status === '已完成' ? 'ok' : o.status === '失败' ? 'fail' : 'doing'}`}>
                {o.status}
              </span>
              <span className="price">{o.balance}</span>
            </div>
          </div>
        ))}
      </div>
      {length > maxShow && (
        <div className="notif-more">
          <span className="notif-more-text">
            还有{length - maxShow}条通知，请点击订单管理查看
          </span>
        </div>
      )}
    </div>
  );
};

export default NotificationTooltip;
