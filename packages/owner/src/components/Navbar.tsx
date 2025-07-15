import '../style/Navbar.scss'
import logo from '../assets/logo1.png'

// import * as React from 'react';

import { Menu } from 'antd';
import {
  SettingOutlined,
  BellOutlined,
  UserOutlined,
  WalletOutlined,
  UnorderedListOutlined,
  CarOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useState } from 'react';

type MenuItem = Required<MenuProps>['items'][number];

export default function Navbar({ onMenuSelect }: { onMenuSelect?: (key: string) => void }) {
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
            theme="light"
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