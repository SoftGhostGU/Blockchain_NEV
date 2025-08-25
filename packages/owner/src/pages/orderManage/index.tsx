import './index.scss'
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
import { Button, Dropdown, Space, Flex, Progress, ConfigProvider, theme } from 'antd';
import { useEffect, useState } from 'react';
import { useColorModeStore } from '../../store/store';

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
    },
    {
      orderId: 'ORD20250717003',
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

  // 计算需要的值
  const rate_order_finish = 98.7;
  const avg_order_benefit = originalOrderList.reduce((acc, cur) => acc + Number(cur.balance.split('￥')[1]), 0) / originalOrderList.length;
  const rate_order_benefit = avg_order_benefit / originalOrderList.reduce((acc, cur) => acc > Number(cur.balance.split('￥')[1]) ? acc : Number(cur.balance.split('￥')[1]), 0) * 100;
  const rate_comment_5 = starCount[0].count / starCount.reduce((acc, cur) => acc + cur.count, 0) * 100;
  const rate_user_satisfaction = starCount.reduce((acc, cur) => acc + cur.star * cur.count / 5, 0) / starCount.reduce((acc, cur) => acc + cur.count, 0) * 100;

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

  const isNightMode = useColorModeStore(state => state.isNightMode);
  useEffect(() => {
    const colomnItem = document.querySelectorAll('.colomn-item');
    const colomnTitle = document.querySelectorAll('.colomn-title');
    const titleInfo = document.querySelectorAll('.title-info');
    const ordersContainer = document.querySelector('.orders-container');
    const orderTitle = document.querySelector('.order-title');
    if (isNightMode) {
      colomnItem.forEach(item => { item.classList.add('night-mode') });
      colomnTitle.forEach(item => { item.classList.add('night-mode') });
      titleInfo.forEach(item => { item.classList.add('night-mode') });
      ordersContainer?.classList.add('night-mode');
      orderTitle?.classList.add('night-mode');
      
    } else {
      colomnItem.forEach(item => { item.classList.remove('night-mode') });
      colomnTitle.forEach(item => { item.classList.remove('night-mode') });
      titleInfo.forEach(item => { item.classList.remove('night-mode') });
      ordersContainer?.classList.remove('night-mode');
      orderTitle?.classList.remove('night-mode');
      
    }
  }, [isNightMode]);

  return (
    <ConfigProvider
      theme={{ algorithm: isNightMode ? theme.darkAlgorithm : theme.defaultAlgorithm }}
    >
      <div className="order-container">
        <div className='colomn-container'>
          <div className='colomn-item'>
            <div className='colomn-title'>评分分布</div>
            <CirclePieChart data={starCount} />
          </div>
          <div className='colomn-item order-item'>
            <div className='info-item line-blue'>
              <div className='info-item-title'>
                <div className='title-info'>订单完成率</div>
                <div className='color-green'>{rate_order_finish.toFixed(1)}%</div>
              </div>
              <Progress
                percent={Number(rate_order_finish.toFixed(1))}
                size="small"
                strokeColor="#79c23e"
                status="active"
                showInfo={false}
              />
            </div>
            <div className='info-item line-greens'>
              <div className='info-item-title'>
                <div className='title-info'>平均订单金额</div>
                <div className='color-blue'>{avg_order_benefit.toFixed(1)}</div>
              </div>
              <Progress
                percent={Number(rate_order_benefit.toFixed(1))}
                size="small"
                strokeColor="#4d77f7"
                status="active"
                showInfo={false}
              />
            </div>
            <div className='info-item line-red'>
              <div className='info-item-title'>
                <div className='title-info'>五星好评率</div>
                <div className='color-yellow'>{rate_comment_5.toFixed(1)}%</div>
              </div>
              <Progress
                percent={Number(rate_comment_5.toFixed(1))}
                size="small"
                strokeColor="#edb53b"
                status="active"
                showInfo={false}
              />
            </div>
            <div className='info-item line-yellow'>
              <div className='info-item-title'>
                <div className='title-info'>用户满意度</div>
                <div className='color-red'>{rate_user_satisfaction.toFixed(1)}</div>
              </div>
              <Progress
                percent={Number(rate_user_satisfaction.toFixed(1))}
                size="small"
                strokeColor="#e24c24"
                status="active"
                showInfo={false}
              />
            </div>
          </div>
        </div>
        <div className='orders-container'>
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
    </ConfigProvider>
  );
}