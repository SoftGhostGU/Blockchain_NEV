import './Navbar.scss'
import logo from '../../assets/logo1.png'
import { useColorModeStore } from '../../store/store'

// import * as React from 'react';

import { Menu } from 'antd';
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

type MenuItem = Required<MenuProps>['items'][number];

export default function Navbar({ onMenuSelect }: { onMenuSelect?: (key: string) => void }) {
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
      console.log("切换到夜间模式")
    } else {
      body.classList.remove('night-mode');
      topNavbar?.classList.remove('night-mode');
      leftNavbar?.classList.remove('night-mode');
      console.log("切换到日间模式")
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
        <div className='left-bar'>
          <img
            className='logo-image'
            src={logo}
          />
          <div className='title'>AutoCrowd</div>
        </div>
        <div className='right-bar'>
          <BellOutlined className='icon' />
          <SettingOutlined className='icon' />
          <UserOutlined className='icon' />
          {isNightMode ? (
            <SunOutlined className='icon' onClick={changeNightMode} />
          ) : (
            <MoonOutlined className='icon' onClick={changeNightMode} />
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
            defaultSelectedKeys={['1']}
            defaultOpenKeys={['sub1']}
            mode="inline"
            theme={isNightMode ? "dark" : "light"}
            items={items}
            className='navbar-menu'
            style={{ lineHeight: '60px' }}
            onSelect={({ key }) => onMenuSelect?.(key)}
          />
          {/* <Button className='button' type="primary" block>车辆信息</Button>
        <Button className='button' block>数据面板</Button>
        <Button className='button' block>订单信息</Button> */}
        </div>
      </div>
    </div>
  )
}