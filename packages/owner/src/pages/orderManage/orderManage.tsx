import '../../style/orderManage.scss'
import CirclePieChart from '../../components/circlePieChart';
import OrderCard from './components/orderCard'

import userAvatar from '../../assets/zjz.jpg'

import {
  CalendarOutlined,
  FieldTimeOutlined,
  FilterOutlined,
  StarOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined
} from '@ant-design/icons';

import { DownOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Button, Dropdown, Space } from 'antd';
import { useState } from 'react';

export default function orderManage() {
  const originalOrderList = [
    {
      orderId: 'ORD20250717001',
      orderTime: '2025-07-17 10:00:00',
      orderType: '网约车',
      balance: '+￥180',
      status: '已完成',
      // operate: '· · ·'
      startLocation: '北京市朝阳区三里屯',
      endLocation: '北京市海淀区中关村',
      userAvatar: userAvatar,
      username: '张俊喆',
      commentStar: 0.5,
      commentText: '非常差劲，车子开得太快了，路上堵车，还不及时让行，要价高，简直黑车！投诉！终身静止使用这个平台！',
    },
    {
      orderId: 'ORD20250717002',
      orderTime: '2025-07-18 10:00:00',
      orderType: '同城配送',
      balance: '+￥150',
      status: '已完成',
      // operate: '· · ·'
      startLocation: '北京市朝阳区三里屯',
      endLocation: '北京市海淀区中关村',
      userAvatar: userAvatar,
      username: '张俊喆',
      commentStar: 5,
      commentText: '非常好，车子开的很稳，路上没有堵车，车主服务态度很好，很快就送达，很满意！',
    }
  ]

  const starCount = [
    { star: 5, count: 20 },
    { star: 4, count: 13 },
    { star: 3, count: 7 },
    { star: 2, count: 6 },
    { star: 1, count: 2 }
  ];

  const [time, setTime] = useState('全部时间');
  const [comment, setComment] = useState('全部评价');
  const [order, setOrder] = useState('时间正序');

  const [orderList, setOrderList] = useState(originalOrderList);

  const dayItems: MenuProps['items'] = [
    {
      label: '全部时间',
      key: '1',
      icon: <FieldTimeOutlined />,
    },
    {
      label: '最近一天',
      key: '2',
      icon: <FieldTimeOutlined />,
    },
    {
      label: '最近一周',
      key: '3',
      icon: <FieldTimeOutlined />,
    },
    {
      label: '最近一个月',
      key: '4',
      icon: <FieldTimeOutlined />,
    },
    {
      label: '最近一年',
      key: '5',
      icon: <FieldTimeOutlined />,
    },
  ];

  const commentItems: MenuProps['items'] = [
    {
      label: '全部评价',
      key: '1',
      icon: <StarOutlined />
    },
    {
      label: '5星',
      key: '2',
      icon: <StarOutlined />
    },
    {
      label: '4星',
      key: '3',
      icon: <StarOutlined />
    },
    {
      label: '3星',
      key: '4',
      icon: <StarOutlined />
    },
    {
      label: '2星',
      key: '5',
      icon: <StarOutlined />
    },
    {
      label: '1星',
      key: '6',
      icon: <StarOutlined />
    },
  ]

  const orderItems: MenuProps['items'] = [
    {
      label: '时间正序',
      key: '1',
      icon: <SortAscendingOutlined />
    },
    {
      label: '时间倒序',
      key: '2',
      icon: <SortDescendingOutlined />
    },
  ]

  const applyFilters = (timeLabel: string, commentLabel: string, orderLabel: string) => {
    let filtered = [...originalOrderList];

    // ⭐ 时间筛选
    if (timeLabel !== '全部时间') {
      const now = new Date().getTime();
      let threshold = now;

      switch (timeLabel) {
        case '最近一天':
          threshold -= 1 * 24 * 60 * 60 * 1000;
          break;
        case '最近一周':
          threshold -= 7 * 24 * 60 * 60 * 1000;
          break;
        case '最近一个月':
          threshold -= 30 * 24 * 60 * 60 * 1000;
          break;
        case '最近一年':
          threshold -= 365 * 24 * 60 * 60 * 1000;
          break;
      }

      filtered = filtered.filter(order =>
        new Date(order.orderTime).getTime() >= threshold
      );
    }

    // ⭐ 星级筛选
    if (commentLabel !== '全部评价') {
      const star = Number(commentLabel[0]); // "5星" => 5
      filtered = filtered.filter(order =>
        Math.ceil(order.commentStar) === star
      );
    }

    // ⭐ 排序
    filtered.sort((a, b) => {
      const t1 = new Date(a.orderTime).getTime();
      const t2 = new Date(b.orderTime).getTime();
      return orderLabel === '时间正序' ? t1 - t2 : t2 - t1;
    });

    setOrderList(filtered);
  };


  const handleDayMenuClick: MenuProps['onClick'] = (e) => {
    const item = dayItems[Number(e.key) - 1];

    if (item && 'label' in item && typeof item.label === 'string') {
      setTime(item.label);
      applyFilters(item.label, comment, order);
    } else {
      setTime('全部时间');
      applyFilters('全部时间', comment, order);
    }
  };

  const handleCommentMenuClick: MenuProps['onClick'] = (e) => {
    const item = commentItems[Number(e.key) - 1];

    if (item && 'label' in item && typeof item.label === 'string') {
      setComment(item.label);
      applyFilters(time, item.label, order);
    } else {
      setComment('全部评价');
      applyFilters(time, '全部评价', order);
    }
  };

  const handleOrderMenuClick: MenuProps['onClick'] = (e) => {
    const item = orderItems[Number(e.key) - 1];
    let newOrder = '时间正序';

    if (item && 'label' in item && typeof item.label === 'string') {
      newOrder = item.label;
      setOrder(newOrder);
    } else {
      setOrder('时间正序');
    }

    const sorted = [...orderList].sort((a, b) => {
      const timeA = new Date(a.orderTime).getTime();
      const timeB = new Date(b.orderTime).getTime();
      return newOrder === '时间正序' ? timeA - timeB : timeB - timeA;
    });

    setOrderList(sorted);
  };


  const dayMenuProps = {
    items: dayItems,
    onClick: handleDayMenuClick,
  };

  const commentMenuProps = {
    items: commentItems,
    onClick: handleCommentMenuClick,
  }

  const orderMenuProps = {
    items: orderItems,
    onClick: handleOrderMenuClick,
  }

  return (
    <div className="order-container">
      <div className='colomn-container'>
        <div className='colomn-item'>
          <div className='colomn-title'>评分分布</div>
          <CirclePieChart data={starCount} />
        </div>
        <div className='colomn-item'>aaa</div>
        <div className='colomn-item'>aaa</div>
      </div>
      <div className='order-container'>
        <div className='order-title'>
          <CalendarOutlined
            style={{ marginRight: '10px' }}
          />
          <Dropdown
            menu={dayMenuProps}
          >
            <Button>
              <Space>
                {time}
                <DownOutlined />
              </Space>
            </Button>
          </Dropdown>

          <FilterOutlined
            style={{
              marginRight: '10px',
              marginLeft: '20px'
            }}
          />
          <Dropdown menu={commentMenuProps}>
            <Button>
              <Space>
                {comment}
                <DownOutlined />
              </Space>
            </Button>
          </Dropdown>

          <SortAscendingOutlined
            style={{
              marginRight: '10px',
              marginLeft: '20px'
            }}
          />
          <Dropdown menu={orderMenuProps}>
            <Button>
              <Space>
                {order}
                <DownOutlined />
              </Space>
            </Button>
          </Dropdown>

          <Button
            style={{
              marginLeft: '20px',
              backgroundColor: '#578ff8',
              color: '#fff',
            }}
            onClick={() => {
              setTime('全部时间');
              setComment('全部评价');
              setOrder('时间正序');
              setOrderList(originalOrderList);
            }}
          >
            重置筛选
          </Button>

        </div>
        <div className='order-card-list'>
          {
            orderList.map((item) => (
              <OrderCard data={item} />
            ))
          }
        </div>
      </div>
    </div>
  );
}