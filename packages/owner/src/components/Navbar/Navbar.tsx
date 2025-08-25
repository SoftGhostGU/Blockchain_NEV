import './Navbar.scss'
import logo from '../../assets/logo1.png'
import { useColorModeStore } from '../../store/store'

import NotificationTooltip from '../NotificationTooltip'

// import * as React from 'react';

import { Menu, Tooltip } from 'antd';
import {
  SettingOutlined,
  BellOutlined,
  UserOutlined,
  WalletOutlined,
  UnorderedListOutlined,
  CarOutlined,
  SunOutlined,
  MoonOutlined
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type MenuItem = Required<MenuProps>['items'][number];

export default function Navbar({ onMenuSelect }: { onMenuSelect?: (key: string) => void }) {

  const orders = [
    {
      orderId: 'ORD20250717001',
      orderTime: '2025-07-17 10:00:00',
      orderType: '网约车',
      balance: '+￥180',
      status: '已完成',
      // operate: '· · ·'
      startLocation: '北京市朝阳区三里屯',
      endLocation: '北京市海淀区中关村',
      // userAvatar: userAvatar,
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
      // userAvatar: userAvatar,
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
      // userAvatar: userAvatar,
      username: '张俊喆',
      commentStar: 5,
      commentText: '非常好，车子开的很稳，路上没有堵车，车主服务态度很好，很快就送达，很满意！',
    }
  ];

  const [selectedKey, setSelectedKey] = useState('0');

  const navigate = useNavigate();

  const isNightMode = useColorModeStore(state => state.isNightMode);
  const toggleColorMode = useColorModeStore(state => state.toggleColorMode);

  const changeNightMode = () => {
    toggleColorMode(!isNightMode);
  }

  useEffect(() => {
    function checkTimeForMode() {
      const currentHour = new Date().getHours();
      console.log("当前时间：", currentHour);
      toggleColorMode(currentHour >= 18 || currentHour < 6);
    }

    checkTimeForMode();

    // 每小时检查一次时间
    const intervalId = setInterval(checkTimeForMode, 3600000);

    // 清除定时器以避免内存泄漏
    return () => clearInterval(intervalId);
  }, [toggleColorMode]);

  useEffect(() => {
    const body = document.body;
    const topNavbar = document.querySelector('.top-navbar');
    const leftNavbar = document.querySelector('.left-navbar');
    if (isNightMode) {
      body.classList.add('night-mode');
      topNavbar?.classList.add('night-mode');
      leftNavbar?.classList.add('night-mode');
      
    } else {
      body.classList.remove('night-mode');
      topNavbar?.classList.remove('night-mode');
      leftNavbar?.classList.remove('night-mode');
      
    }
  }, [isNightMode]);

  const [name, _] = useState('ZHANGSAN');
  const items: MenuItem[] = [
    {
      key: '1',
      icon: <CarOutlined />,
      label: '车辆管理'
    },
    {
      key: '2',
      icon: <UnorderedListOutlined />,
      label: '收益统计'
    },
    {
      key: '3',
      icon: <WalletOutlined />,
      label: '订单管理'
    },
    {
      key: '4',
      icon: <SettingOutlined />,
      label: '设置'
    }
    // {
    //   key: 'sub1',
    //   label: 'Navigation One',
    //   icon: <MailOutlined />,
    //   children: [
    //     { key: '5', label: 'Option 5' },
    //     { key: '6', label: 'Option 6' },
    //     { key: '7', label: 'Option 7' },
    //     { key: '8', label: 'Option 8' },
    //   ],
    // }
  ];

  return (
    <div className='navbar'>
      <div className='top-navbar'>
        <div
          className='left-bar'
          onClick={() => {
            setSelectedKey('0');
            onMenuSelect?.('0');
          }}
        >
          <img
            className='logo-image'
            src={logo}
          />
          <div className='title'>AutoCrowd</div>
        </div>

        <div className='right-bar'>
          <Tooltip
            trigger="hover"                 // 鼠标悬停更适合列表
            placement="bottomRight"
            color={isNightMode ? '#1f2937' : '#ffffff'}
            overlayInnerStyle={{
              padding: 12,                  // 让内边距合适
              minWidth: 320,                // 和上面 scss 对齐
              maxWidth: 420,                // 避免太宽
              color: isNightMode ? '#f9fafb' : '#111827'  // 字体颜色
            }}
            title={<NotificationTooltip orders={orders} />}
          >
            <BellOutlined className='icon' />
          </Tooltip>
          <Tooltip title="修改车辆信息">
            <CarOutlined className='icon' />
          </Tooltip>
          <Tooltip title="修改个人信息">
            <SettingOutlined className='icon' onClick={() => {
              navigate("/dashboard/settings");
              setSelectedKey?.("4");
            }} />
          </Tooltip>
          {isNightMode ? (
            <Tooltip title="切换日间模式">
              <SunOutlined className='icon' onClick={changeNightMode} />
            </Tooltip>
          ) : (
            <Tooltip title="切换夜间模式">
              <MoonOutlined className='icon' onClick={changeNightMode} />
            </Tooltip>
          )}
          <div className='owner-name'>{name}</div>
        </div>
      </div>
      <div className='main-content'>
        <div className='left-navbar'>
          {/* <Button type="primary" onClick={toggleCollapsed} style={{ marginBottom: 16 }}>
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </Button> */}
          <Menu
            defaultSelectedKeys={['0']}
            defaultOpenKeys={['sub1']}
            mode="inline"
            theme={isNightMode ? "dark" : "light"}
            items={items}
            className='navbar-menu'
            style={{
              width: 'calc(100% - 10px)',
              lineHeight: '60px',
              marginLeft: '10px'
            }}
            selectedKeys={[selectedKey]}
            onSelect={({ key }) => {
              setSelectedKey(key);        // 更新高亮
              onMenuSelect?.(key);        // 通知父组件   
            }}
          />
          {/* <Button className='button' type="primary" block>车辆信息</Button>
        <Button className='button' block>数据面板</Button>
        <Button className='button' block>订单信息</Button> */}
        </div>
      </div>
    </div>
  )
}