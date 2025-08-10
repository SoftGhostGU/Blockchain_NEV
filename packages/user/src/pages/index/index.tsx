import React, { useState, useRef } from 'react';
import { View, Text, Image, Button, Input, ScrollView, Switch } from '@tarojs/components';
import logo1 from '../../assets/logo1.png';
import map1 from '../../assets/map1.png';
import './index.scss';

// 定义用户信息类型
interface UserInfo {
  avatar: string;
  nickname: string;
  phone: string;
  balance: number;
  level: string;
  points: number;
  verified: boolean;
  memberExpire: string;
  address: string;
  email: string;
}

// 定义订单类型
interface Order {
  id: string;
  start: string;
  end: string;
  time: string;
  price: number;
  status: '进行中' | '已完成' | '已取消';
  driver?: string;
  carModel?: string;
  licensePlate?: string;
}

// 定义菜单按钮类型
type MenuButton = '个人信息' | '订单管理' | '设置';

export default function Profile() {
  const [userInfo] = useState<UserInfo>({
    avatar: 'https://img.shetu66.com/2023/07/04/1688452147066774.png',
    nickname: '张三',
    phone: '138****8888',
    balance: 56.8,
    level: 'VIP会员',
    points: 1200,
    verified: true,
    memberExpire: '2025-12-31',
    address: '北京市海淀区中关村大街1号',
    email: 'zhangsan@example.com'
  });

  const [activeTab, setActiveTab] = useState<MenuButton>('个人信息');
  const [hoveredButton, setHoveredButton] = useState<MenuButton | null>(null);
  const [hoveredOrder, setHoveredOrder] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [buttonHover, setButtonHover] = useState({ 
    cancel: false, 
    contact: false, 
    create: false 
  });
  
  // 新增：设置面板按钮悬浮状态
  const [settingsButtonHover, setSettingsButtonHover] = useState({
    phoneChange: false,
    realNameAuth: false,
    changePassword: false,
    deviceManage: false,
    privacyManage: false,
    clearCache: false,
    userAgreement: false,
    privacyPolicy: false,
    checkUpdate: false,
    contactService: false
  });
  
  // 订单管理相关状态
  const [currentOrder, setCurrentOrder] = useState<Order | null>({
    id: '20230810001',
    start: '北京市海淀区中关村大街',
    end: '北京首都国际机场T3航站楼',
    time: '2023-08-10 14:30',
    price: 85.0,
    status: '进行中',
    driver: '李师傅',
    carModel: '丰田凯美瑞',
    licensePlate: '京A·88888'
  });
  
  const [newOrderStart, setNewOrderStart] = useState('');
  const [newOrderEnd, setNewOrderEnd] = useState('');
  
  const [historyOrders] = useState<Order[]>([
    {
      id: '20230809002',
      start: '朝阳区三里屯',
      end: '西单大悦城',
      time: '2023-08-09 19:45',
      price: 42.5,
      status: '已完成'
    },
    {
      id: '20230808003',
      start: '北京市海淀区清华大学',
      end: '北京南站',
      time: '2023-08-08 16:20',
      price: 38.0,
      status: '已完成'
    },
    {
      id: '20230807004',
      start: '王府井大街',
      end: '颐和园',
      time: '2023-08-07 10:15',
      price: 65.0,
      status: '已完成'
    },
    {
      id: '20230806005',
      start: '国贸CBD',
      end: '首都机场T2',
      time: '2023-08-06 08:30',
      price: 92.0,
      status: '已取消'
    }
  ]);

  // 地图拖动相关状态
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  
  // 设置面板相关状态
  const [settings, setSettings] = useState({
    darkMode: false,
    notifications: {
      orderUpdates: true,
      promotions: true,
      accountSecurity: true
    },
    privacy: {
      showProfileToDrivers: true,
      locationSharing: true,
      shareRideInfo: false
    },
    payment: {
      defaultMethod: 'alipay',
      saveCards: true
    },
    language: 'zh-CN',
    cacheSize: '128MB'
  });

  const handleTouchStart = (button: MenuButton) => {
    setHoveredButton(button);
  };

  const handleTouchEnd = () => {
    setHoveredButton(null);
  };

  const handleOrderHover = (orderId: string | null) => {
    setHoveredOrder(orderId);
  };

  const handleCardHover = (cardId: string | null) => {
    setHoveredCard(cardId);
  };

  const handleCreateOrder = () => {
    if (newOrderStart && newOrderEnd) {
      alert(`已创建订单：从 ${newOrderStart} 到 ${newOrderEnd}`);
      setNewOrderStart('');
      setNewOrderEnd('');
    } else {
      alert('请填写完整的起始和目的地');
    }
  };

  const handleCancelOrder = () => {
    if (currentOrder) {
      setCurrentOrder(null);
      alert('订单已取消');
    }
  };

  // 地图拖动处理函数
  const handleMapTouchStart = (e) => {
    setIsDragging(true);
    setStartPos({
      x: e.touches[0].clientX - position.x,
      y: e.touches[0].clientY - position.y
    });
  };

  const handleMapTouchMove = (e) => {
    if (!isDragging) return;
    
    const newX = e.touches[0].clientX - startPos.x;
    const newY = e.touches[0].clientY - startPos.y;
    
    // 限制拖动范围（可根据需要调整）
    const maxX = 200;
    const maxY = 200;
    const boundedX = Math.max(Math.min(newX, maxX), -maxX);
    const boundedY = Math.max(Math.min(newY, maxY), -maxY);
    
    setPosition({ x: boundedX, y: boundedY });
  };

  const handleMapTouchEnd = () => {
    setIsDragging(false);
  };

  // 按钮悬浮效果处理
  const handleButtonHover = (button, isHovering) => {
    setButtonHover(prev => ({ ...prev, [button]: isHovering }));
  };
  
  // 设置面板按钮悬浮效果处理
  const handleSettingsButtonHover = (button, isHovering) => {
    setSettingsButtonHover(prev => ({ ...prev, [button]: isHovering }));
  };

  // 切换设置项
  const toggleSetting = (category, setting) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: !prev[category][setting]
      }
    }));
  };

  // 更改支付方式
  const changePaymentMethod = (method) => {
    setSettings(prev => ({
      ...prev,
      payment: {
        ...prev.payment,
        defaultMethod: method
      }
    }));
  };

  // 更改语言
  const changeLanguage = (lang) => {
    setSettings(prev => ({
      ...prev,
      language: lang
    }));
  };

  // 清除缓存
  const clearCache = () => {
    setSettings(prev => ({
      ...prev,
      cacheSize: '0MB'
    }));
    alert('缓存已清除！');
  };

  // 菜单按钮样式
  const menuBtnStyle = {
    background: '#fff',
    borderRadius: 10,
    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
    color: '#333',
    fontSize: 16,
    padding: '0',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    height: '48px',
    transition: 'transform 0.2s ease-in-out, background-color 0.2s ease-in-out'
  } as React.CSSProperties;

  // 卡片基础样式
  const cardStyle: React.CSSProperties = {
    background: '#fff',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    padding: '20px',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    transform: 'scale(1)'
  };

  // 卡片悬浮效果
  const hoverCardStyle: React.CSSProperties = {
    transform: 'scale(1.02)',
    boxShadow: '0 5px 15px rgba(0,0,0,0.15)',
    zIndex: 10
  };
  
  // 设置面板按钮基础样式
  const settingsButtonStyle = {
    background: '#fff',
    color: '#1976d2',
    border: '1px solid #1976d2',
    borderRadius: '6px',
    padding: '6px 15px',
    fontSize: 13,
    height: '32px',
    lineHeight: '20px',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  };
  
  // 设置面板按钮悬浮样式
  const settingsButtonHoverStyle = {
    background: '#1976d2',
    color: '#fff',
    transform: 'translateY(-1px)',
    boxShadow: '0 2px 5px rgba(25, 118, 210, 0.3)'
  };

  return (
    <View className="profile-page" style={{ 
      display: 'flex', 
      flexDirection: 'row', 
      background: '#f7f8fa', 
      minHeight: '100vh',
      fontFamily: '"PingFang SC", "Helvetica Neue", Arial, sans-serif'
    }}>
      {/* 侧边栏导航 */}
      <View className="sidebar" style={{ 
        width: '240px', 
        background: '#fff', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
        padding: '20px',
        position: 'sticky',
        top: 0,
        height: '100vh'
      }}>
        {/* Logo和标题在同一行 */}
        <View style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: '30px',
          padding: '0 0 15px',
          borderBottom: '1px solid #eee'
        }}>
          <Image src={logo1} style={{ width: 65, height: 65, marginRight: 10 }} />
          {/* 标题 */}
          <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#222' }}>AutoCrowd</Text>
        </View>
        
        <View style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* 个人信息按钮 */}
          <View
            className="menu-btn"
            style={{
              ...menuBtnStyle,
              transform: hoveredButton === '个人信息' ? 'scale(1.05)' : 'scale(1)',
              backgroundColor: hoveredButton === '个人信息' ? '#f0f5ff' : '#fff',
              boxShadow: hoveredButton === '个人信息' ? '0 4px 12px rgba(25, 118, 210, 0.15)' : '0 2px 8px rgba(0,0,0,0.03)',
              color: hoveredButton === '个人信息' ? '#1976d2' : '#333',
            }}
            onTouchStart={() => handleTouchStart('个人信息')}
            onTouchEnd={handleTouchEnd}
            onClick={() => setActiveTab('个人信息')}
          >
            <Text style={{ fontSize: 18, marginRight: 7 }}>👤</Text>
            个人信息
          </View>
          
          {/* 订单管理按钮 */}
          <View
            className="menu-btn"
            style={{
              ...menuBtnStyle,
              transform: hoveredButton === '订单管理' ? 'scale(1.05)' : 'scale(1)',
              backgroundColor: hoveredButton === '订单管理' ? '#f0f5ff' : '#fff',
              boxShadow: hoveredButton === '订单管理' ? '0 4px 12px rgba(25, 118, 210, 0.15)' : '0 2px 8px rgba(0,0,0,0.03)',
              color: hoveredButton === '订单管理' ? '#1976d2' : '#333',
            }}
            onTouchStart={() => handleTouchStart('订单管理')}
            onTouchEnd={handleTouchEnd}
            onClick={() => setActiveTab('订单管理')}
          >
            <Text style={{ fontSize: 18, marginRight: 7 }}>📦</Text>
            订单管理
          </View>
          
          {/* 设置按钮 */}
          <View
            className="menu-btn"
            style={{
              ...menuBtnStyle,
              transform: hoveredButton === '设置' ? 'scale(1.05)' : 'scale(1)',
              backgroundColor: hoveredButton === '设置' ? '#f0f5ff' : '#fff',
              boxShadow: hoveredButton === '设置' ? '0 4px 12px rgba(25, 118, 210, 0.15)' : '0 2px 8px rgba(0,0,0,0.03)',
              color: hoveredButton === '设置' ? '#1976d2' : '#333',
            }}
            onTouchStart={() => handleTouchStart('设置')}
            onTouchEnd={handleTouchEnd}
            onClick={() => setActiveTab('设置')}
          >
            <Text style={{ fontSize: 18, marginRight: 7 }}>⚙️</Text>
            设置
          </View>
        </View>
        
        {/* 侧边栏底部信息 */}
        <View style={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          right: 20,
          paddingTop: 20,
          borderTop: '1px solid #f0f0f0',
          fontSize: 12,
          color: '#888',
          textAlign: 'center'
        }}>
          <Text>当前版本: v0.0.0</Text>
          <Text style={{ display: 'block', marginTop: 5 }}>© 2023 AutoCrowd Inc.</Text>
        </View>
      </View>

      {/* 主内容区域 */}
      <View className="main-content" style={{ flex: 1, padding: '20px', maxWidth: '1200px' }}>
        {/* 个人信息面板 */}
        {activeTab === '个人信息' && (
          <View>
            <View style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '20px' }}>
              {/* 头像和基本信息 */}
              <View className="avatar-section info-card" style={{ 
                background: '#fff', 
                borderRadius: '16px', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)', 
                padding: '25px', 
                width: '100%', 
                display: 'flex', 
                alignItems: 'center' 
              }}>
                <Image src={userInfo.avatar} style={{ 
                  width: 120, 
                  height: 120, 
                  borderRadius: '50%', 
                  marginRight: 20, 
                  border: '3px solid #1976d2',
                  boxShadow: '0 4px 8px rgba(25, 118, 210, 0.2)'
                }} />
                <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <View style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                    <Text style={{ fontSize: 18, color: '#222', fontWeight: '600' }}>{userInfo.nickname}</Text>
                    {userInfo.verified && (
                      <Text style={{ 
                        color: '#4caf50', 
                        fontSize: 13, 
                        marginLeft: 10,
                        background: '#e8f5e9',
                        padding: '3px 8px',
                        borderRadius: '20px'
                      }}>✔️ 已认证</Text>
                    )}
                  </View>
                  <Text style={{ fontSize: 14, color: '#666', marginBottom: 8, display: 'flex', alignItems: 'center' }}>
                    <Text style={{ marginRight: 5 }}>📱</Text>{userInfo.phone}
                  </Text>
                  <Text style={{ 
                    fontSize: 14, 
                    color: '#ff9800', 
                    fontWeight: 'bold', 
                    marginBottom: 8,
                    background: '#fff8e1',
                    padding: '5px 12px',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center'
                  }}>🏅 {userInfo.level}</Text>
                  <Text style={{ fontSize: 14, color: '#1976d2', display: 'flex', alignItems: 'center' }}>
                    <Text style={{ marginRight: 5 }}>⏳</Text>会员到期：{userInfo.memberExpire}
                  </Text>
                </View>
              </View>

              {/* 常用信息卡片 */}
              <View className="info-card" style={{ 
                background: '#fff', 
                borderRadius: '16px', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)', 
                padding: '25px', 
                width: '100%' 
              }}>
                <View style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                  <Text style={{ fontSize: 16, marginRight: 8, color: '#1976d2' }}>📍</Text>
                  <Text style={{ fontSize: 15 }}>常用地址：{userInfo.address}</Text>
                </View>
                <View style={{ display: 'flex', alignItems: 'center' }}>
                  <Text style={{ fontSize: 16, marginRight: 8, color: '#1976d2' }}>✉️</Text>
                  <Text style={{ fontSize: 15 }}>邮箱：{userInfo.email}</Text>
                </View>
              </View>

              {/* 钱包余额卡片 */}
              <View className="wallet-card info-card" style={{ 
                background: '#fff', 
                borderRadius: '16px', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)', 
                padding: '25px', 
                width: '100%' 
              }}>
                <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ display: 'flex', alignItems: 'center' }}>
                    <Text style={{ fontSize: 16, marginRight: 10 }}>钱包余额</Text>
                    <Text style={{ fontWeight: 'bold', fontSize: 24, color: '#e91e63' }}>{userInfo.balance.toFixed(2)}</Text>
                    <Text style={{ fontSize: 15, marginLeft: 2 }}>元</Text>
                  </View>
                  <Button className="menu-btn recharge-btn" style={{
                    background: '#1976d2',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 20px',
                    fontSize: 14,
                    cursor: 'pointer',
                    minHeight: '36px',
                    height: '36px',
                    lineHeight: '20px',
                    boxSizing: 'border-box',
                    width: 'auto',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 3px 6px rgba(25, 118, 210, 0.2)',
                    ':hover': {
                      background: '#1565c0',
                      transform: 'translateY(-2px)'
                    }
                  }}>充值</Button>
                </View>
              </View>
              
              {/* 积分卡片 */}
              <View className="points-card info-card" style={{ 
                background: '#fff', 
                borderRadius: '16px', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)', 
                padding: '25px', 
                width: '100%' 
              }}>
                <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ display: 'flex', alignItems: 'center' }}>
                    <Text style={{ fontSize: 16, marginRight: 10 }}>积分</Text>
                    <Text style={{ fontWeight: 'bold', fontSize: 24, color: '#ff9800' }}>{userInfo.points}</Text>
                  </View>
                  <Button className="menu-btn recharge-btn" style={{
                    background: '#1976d2',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 20px',
                    fontSize: 14,
                    cursor: 'pointer',
                    minHeight: '36px',
                    height: '36px',
                    lineHeight: '20px',
                    boxSizing: 'border-box',
                    width: 'auto',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 3px 6px rgba(25, 118, 210, 0.2)',
                    ':hover': {
                      background: '#1565c0',
                      transform: 'translateY(-2px)'
                    }
                  }}>兑换</Button>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* 订单管理面板 */}
        {activeTab === '订单管理' && (
          <View style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* 地图区域 - 可拖动 */}
            <View 
              className="map-section" 
              style={{ 
                ...cardStyle,
                ...(hoveredCard === 'map' ? hoverCardStyle : {}),
                minHeight: '300px',
                position: 'relative',
                overflow: 'hidden',
                touchAction: 'none',
                borderRadius: '16px',
                background: '#f0f7ff'
              }}
              onMouseEnter={() => handleCardHover('map')}
              onMouseLeave={() => handleCardHover(null)}
              onTouchStart={handleMapTouchStart}
              onTouchMove={handleMapTouchMove}
              onTouchEnd={handleMapTouchEnd}
              onTouchCancel={handleMapTouchEnd}
            >
              <View style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(255,255,255,0.8)'
              }}>
                {/* 地图占位图 */}
                <View 
                  src={map1}
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundImage: `url(${map1})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    transform: `translate(${position.x}px, ${position.y}px)`,
                    transition: isDragging ? 'none' : 'transform 0.3s ease'
                  }}
                >
                </View>
              </View>
              <View style={{
                position: 'absolute',
                top: 15,
                right: 15,
                background: 'rgba(255,255,255,0.9)',
                padding: '8px 15px',
                borderRadius: 20,
                display: 'flex',
                alignItems: 'center',
                zIndex: 10,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                fontSize: 14
              }}>
                <Text style={{ color: '#333' }}>📍 当前位置: 北京市海淀区</Text>
              </View>
              <View style={{
                position: 'absolute',
                bottom: 15,
                left: 15,
                background: 'rgba(255,255,255,0.7)',
                padding: '8px 12px',
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                zIndex: 10,
                fontSize: 13
              }}>
                <Text style={{ color: '#666' }}>拖动地图可查看不同区域</Text>
              </View>
            </View>

            {/* 当前订单和发起订单区域 */}
            <View style={{ display: 'flex', gap: '20px' }}>
              {/* 当前订单卡片 */}
              <View 
                style={{ 
                  ...cardStyle,
                  ...(hoveredCard === 'currentOrder' ? hoverCardStyle : {}),
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: '16px'
                }}
                onMouseEnter={() => handleCardHover('currentOrder')}
                onMouseLeave={() => handleCardHover(null)}
              >
                <Text style={{ 
                  fontSize: 17, 
                  fontWeight: 'bold', 
                  marginBottom: '15px', 
                  color: '#333',
                  textAlign: 'center',
                  paddingBottom: '10px',
                  borderBottom: '1px solid #f0f0f0'
                }}>
                  {currentOrder ? '当前订单' : '暂无进行中的订单'}
                </Text>
                
                {currentOrder ? (
                  <View>
                    <View style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <View style={{ display: 'flex', alignItems: 'center' }}>
                        <Text style={{ width: '80px', color: '#666', fontSize: 14 }}>订单号:</Text>
                        <Text style={{ flex: 1, fontSize: 14 }}>{currentOrder.id}</Text>
                      </View>
                      <View style={{ display: 'flex', alignItems: 'center' }}>
                        <Text style={{ width: '80px', color: '#666', fontSize: 14 }}>出发地:</Text>
                        <Text style={{ flex: 1, fontSize: 14 }}>{currentOrder.start}</Text>
                      </View>
                      <View style={{ display: 'flex', alignItems: 'center' }}>
                        <Text style={{ width: '80px', color: '#666', fontSize: 14 }}>目的地:</Text>
                        <Text style={{ flex: 1, fontSize: 14 }}>{currentOrder.end}</Text>
                      </View>
                      <View style={{ display: 'flex', alignItems: 'center' }}>
                        <Text style={{ width: '80px', color: '#666', fontSize: 14 }}>时间:</Text>
                        <Text style={{ flex: 1, fontSize: 14 }}>{currentOrder.time}</Text>
                      </View>
                      <View style={{ display: 'flex', alignItems: 'center' }}>
                        <Text style={{ width: '80px', color: '#666', fontSize: 14 }}>费用:</Text>
                        <Text style={{ flex: 1, color: '#e91e63', fontWeight: 'bold', fontSize: 14 }}>¥{currentOrder.price.toFixed(2)}</Text>
                      </View>
                      <View style={{ display: 'flex', alignItems: 'center' }}>
                        <Text style={{ width: '80px', color: '#666', fontSize: 14 }}>状态:</Text>
                        <Text style={{ 
                          flex: 1, 
                          color: currentOrder.status === '进行中' ? '#4caf50' : 
                                 currentOrder.status === '已完成' ? '#2196f3' : '#f44336',
                          fontWeight: 'bold',
                          fontSize: 14
                        }}>
                          {currentOrder.status}
                        </Text>
                      </View>
                      
                      {currentOrder.driver && (
                        <>
                          <View style={{ marginTop: '15px', borderTop: '1px dashed #eee', paddingTop: '15px' }}>
                            <Text style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: 15 }}>车主信息</Text>
                            <View style={{ display: 'flex', alignItems: 'center' }}>
                              <Text style={{ width: '80px', color: '#666', fontSize: 14 }}>姓名:</Text>
                              <Text style={{ flex: 1, fontSize: 14 }}>{currentOrder.driver}</Text>
                            </View>
                            <View style={{ display: 'flex', alignItems: 'center' }}>
                              <Text style={{ width: '80px', color: '#666', fontSize: 14 }}>车型:</Text>
                              <Text style={{ flex: 1, fontSize: 14 }}>{currentOrder.carModel}</Text>
                            </View>
                            <View style={{ display: 'flex', alignItems: 'center' }}>
                              <Text style={{ width: '80px', color: '#666', fontSize: 14 }}>车牌:</Text>
                              <Text style={{ flex: 1, fontSize: 14 }}>{currentOrder.licensePlate}</Text>
                            </View>
                          </View>
                        </>
                      )}
                    </View>
                    
                    <View style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
                      <Button 
                        style={{
                          flex: 1,
                          background: buttonHover.cancel ? '#d32f2f' : '#f44336',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '10px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          fontSize: 14,
                          height: '40px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: buttonHover.cancel ? '0 4px 8px rgba(244, 67, 54, 0.3)' : '0 2px 5px rgba(244, 67, 54, 0.2)'
                        }}
                        onMouseEnter={() => handleButtonHover('cancel', true)}
                        onMouseLeave={() => handleButtonHover('cancel', false)}
                        onClick={handleCancelOrder}
                      >
                        取消订单
                      </Button>
                      <Button 
                        style={{
                          flex: 1,
                          background: buttonHover.contact ? '#1976d2' : '#2196f3',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '10px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          fontSize: 14,
                          height: '40px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: buttonHover.contact ? '0 4px 8px rgba(33, 150, 243, 0.3)' : '0 2px 5px rgba(33, 150, 243, 0.2)'
                        }}
                        onMouseEnter={() => handleButtonHover('contact', true)}
                        onMouseLeave={() => handleButtonHover('contact', false)}
                      >
                        联系车主
                      </Button>
                    </View>
                  </View>
                ) : (
                  <View style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    height: '180px',
                    color: '#888',
                    fontSize: 15
                  }}>
                    <Text style={{ fontSize: 15, marginBottom: '10px' }}>您当前没有进行中的订单</Text>
                    <Text style={{ fontSize: 14 }}>请创建一个新订单</Text>
                  </View>
                )}
              </View>

              {/* 发起订单卡片 */}
              <View 
                style={{ 
                  ...cardStyle,
                  ...(hoveredCard === 'createOrder' ? hoverCardStyle : {}),
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: '16px'
                }}
                onMouseEnter={() => handleCardHover('createOrder')}
                onMouseLeave={() => handleCardHover(null)}
              >
                <Text style={{ 
                  fontSize: 17, 
                  fontWeight: 'bold', 
                  marginBottom: '15px', 
                  color: '#333',
                  textAlign: 'center',
                  paddingBottom: '10px',
                  borderBottom: '1px solid #f0f0f0'
                }}>
                  发起新订单
                </Text>
                
                <View style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <View>
                    <Text style={{ marginBottom: '8px', color: '#666', fontSize: 14 }}>出发地</Text>
                    <Input
                      value={newOrderStart}
                      onInput={(e) => setNewOrderStart(e.detail.value)}
                      placeholder="请输入出发地"
                      style={{
                        padding: '12px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        background: '#f9f9f9',
                        fontSize: 14
                      }}
                    />
                  </View>
                  
                  <View>
                    <Text style={{ marginBottom: '8px', color: '#666', fontSize: 14 }}>目的地</Text>
                    <Input
                      value={newOrderEnd}
                      onInput={(e) => setNewOrderEnd(e.detail.value)}
                      placeholder="请输入目的地"
                      style={{
                        padding: '12px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        background: '#f9f9f9',
                        fontSize: 14
                      }}
                    />
                  </View>
                  
                  <View style={{ marginTop: '10px' }}>
                    <Button 
                      style={{
                        width: '100%',
                        background: buttonHover.create ? '#388e3c' : '#4caf50',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        fontSize: 15,
                        height: '44px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: buttonHover.create ? '0 4px 8px rgba(76, 175, 80, 0.3)' : '0 2px 5px rgba(76, 175, 80, 0.2)'
                      }}
                      onMouseEnter={() => handleButtonHover('create', true)}
                      onMouseLeave={() => handleButtonHover('create', false)}
                      onClick={handleCreateOrder}
                    >
                      立即叫车
                    </Button>
                  </View>
                  
                  <View style={{ 
                    marginTop: '20px', 
                    paddingTop: '15px', 
                    borderTop: '1px dashed #eee',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 15 }}>预估费用</Text>
                    <View style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                      <Text style={{ color: '#666' }}>基础费用:</Text>
                      <Text>¥25.00</Text>
                    </View>
                    <View style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                      <Text style={{ color: '#666' }}>里程费用:</Text>
                      <Text>¥30.00</Text>
                    </View>
                    <View style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      fontWeight: 'bold',
                      fontSize: 15,
                      marginTop: '5px',
                      paddingTop: '8px',
                      borderTop: '1px solid #f0f0f0'
                    }}>
                      <Text>总计:</Text>
                      <Text style={{ color: '#e91e63', fontSize: 16 }}>¥55.00</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* 历史订单区域 */}
            <View 
              style={{ 
                ...cardStyle,
                ...(hoveredCard === 'historyOrders' ? hoverCardStyle : {}),
                padding: '20px',
                borderRadius: '16px'
              }}
              onMouseEnter={() => handleCardHover('historyOrders')}
              onMouseLeave={() => handleCardHover(null)}
            >
              <Text style={{ 
                fontSize: 17, 
                fontWeight: 'bold', 
                marginBottom: '15px', 
                color: '#333',
                textAlign: 'center',
                paddingBottom: '10px',
                borderBottom: '1px solid #f0f0f0'
              }}>
                历史订单
              </Text>
              
              {historyOrders.length === 0 ? (
                <View style={{ textAlign: 'center', padding: '30px 0', color: '#888', fontSize: 14 }}>
                  暂无历史订单记录
                </View>
              ) : (
                <ScrollView scrollY style={{ maxHeight: '400px' }}>
                  <View style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {historyOrders.map(order => (
                      <View 
                        key={order.id}
                        style={{
                          ...cardStyle,
                          padding: '15px',
                          transform: hoveredOrder === order.id ? 'scale(1.02)' : 'scale(1)',
                          boxShadow: hoveredOrder === order.id ? '0 5px 15px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.08)',
                          transition: 'all 0.3s ease',
                          borderRadius: '12px'
                        }}
                        onMouseEnter={() => handleOrderHover(order.id)}
                        onMouseLeave={() => handleOrderHover(null)}
                      >
                        <View style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                          <Text style={{ fontWeight: 'bold', fontSize: 14 }}>订单号: {order.id}</Text>
                          <Text style={{ 
                            color: order.status === '已完成' ? '#4caf50' : 
                                   order.status === '已取消' ? '#f44336' : '#2196f3',
                            fontWeight: 'bold',
                            fontSize: 14
                          }}>
                            {order.status}
                          </Text>
                        </View>
                        
                        <View style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <View style={{ display: 'flex' }}>
                            <Text style={{ width: '60px', color: '#666', fontSize: 13 }}>出发:</Text>
                            <Text style={{ flex: 1, fontSize: 13 }}>{order.start}</Text>
                          </View>
                          <View style={{ display: 'flex' }}>
                            <Text style={{ width: '60px', color: '#666', fontSize: 13 }}>到达:</Text>
                            <Text style={{ flex: 1, fontSize: 13 }}>{order.end}</Text>
                          </View>
                          <View style={{ display: 'flex' }}>
                            <Text style={{ width: '60px', color: '#666', fontSize: 13 }}>时间:</Text>
                            <Text style={{ flex: 1, fontSize: 13 }}>{order.time}</Text>
                          </View>
                          <View style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                            <Text style={{ color: '#666', fontSize: 13 }}>费用:</Text>
                            <Text style={{ fontWeight: 'bold', color: '#e91e63', fontSize: 14 }}>¥{order.price.toFixed(2)}</Text>
                          </View>
                        </View>
                        
                        <View style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                          <Button 
                            style={{
                              background: hoveredOrder === order.id ? '#2196f3' : '#fff',
                              color: hoveredOrder === order.id ? '#fff' : '#2196f3',
                              border: '1px solid #2196f3',
                              borderRadius: '6px',
                              padding: '6px 15px',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              fontSize: 13
                            }}
                          >
                            查看详情
                          </Button>
                        </View>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              )}
            </View>
          </View>
        )}

        {/* 设置面板 */}
        {activeTab === '设置' && (
          <View style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* 账号安全设置卡片 */}
            <View style={{ 
              background: '#fff', 
              borderRadius: '16px', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)', 
              padding: '25px'
            }}>
              <Text style={{ 
                fontSize: 18, 
                fontWeight: 'bold', 
                marginBottom: '20px', 
                color: '#333',
                display: 'block',
                paddingBottom: '10px',
                borderBottom: '1px solid #f0f0f0'
              }}>
                账号安全
              </Text>
              
              <View style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 15, color: '#555' }}>手机号绑定</Text>
                  <View style={{ display: 'flex', alignItems: 'center' }}>
                    <Text style={{ marginRight: '10px', color: '#1976d2', fontSize: 14 }}>{userInfo.phone}</Text>
                    <Button 
                      style={{
                        ...settingsButtonStyle,
                        ...(settingsButtonHover.phoneChange ? settingsButtonHoverStyle : {})
                      }}
                      onMouseEnter={() => handleSettingsButtonHover('phoneChange', true)}
                      onMouseLeave={() => handleSettingsButtonHover('phoneChange', false)}
                    >更换</Button>
                  </View>
                </View>
                
                <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 15, color: '#555' }}>实名认证</Text>
                  <View style={{ display: 'flex', alignItems: 'center' }}>
                    {userInfo.verified ? (
                      <Text style={{ color: '#4caf50', fontSize: 14, marginRight: '10px' }}>已认证</Text>
                    ) : (
                      <Text style={{ color: '#f44336', fontSize: 14, marginRight: '10px' }}>未认证</Text>
                    )}
                    <Button 
                      style={{
                        ...settingsButtonStyle,
                        background: userInfo.verified ? '#f5f5f5' : settingsButtonHover.realNameAuth ? '#1565c0' : '#1976d2',
                        color: userInfo.verified ? '#999' : '#fff',
                        border: 'none',
                        ...(settingsButtonHover.realNameAuth ? {
                          transform: 'translateY(-1px)',
                          boxShadow: '0 2px 5px rgba(25, 118, 210, 0.3)'
                        } : {})
                      }}
                      disabled={userInfo.verified}
                      onMouseEnter={() => handleSettingsButtonHover('realNameAuth', true)}
                      onMouseLeave={() => handleSettingsButtonHover('realNameAuth', false)}
                    >
                      {userInfo.verified ? '已完成' : '去认证'}
                    </Button>
                  </View>
                </View>
                
                <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 15, color: '#555' }}>修改密码</Text>
                  <Button 
                    style={{
                      ...settingsButtonStyle,
                      ...(settingsButtonHover.changePassword ? settingsButtonHoverStyle : {})
                    }}
                    onMouseEnter={() => handleSettingsButtonHover('changePassword', true)}
                    onMouseLeave={() => handleSettingsButtonHover('changePassword', false)}
                  >修改</Button>
                </View>
                
                <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 15, color: '#555' }}>登录设备管理</Text>
                  <Button 
                    style={{
                      ...settingsButtonStyle,
                      ...(settingsButtonHover.deviceManage ? settingsButtonHoverStyle : {})
                    }}
                    onMouseEnter={() => handleSettingsButtonHover('deviceManage', true)}
                    onMouseLeave={() => handleSettingsButtonHover('deviceManage', false)}
                  >查看</Button>
                </View>
              </View>
            </View>

            {/* 通知设置卡片 */}
            <View style={{ 
              background: '#fff', 
              borderRadius: '16px', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)', 
              padding: '25px'
            }}>
              <Text style={{ 
                fontSize: 18, 
                fontWeight: 'bold', 
                marginBottom: '20px', 
                color: '#333',
                display: 'block',
                paddingBottom: '10px',
                borderBottom: '1px solid #f0f0f0'
              }}>
                通知设置
              </Text>
              
              <View style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View>
                    <Text style={{ fontSize: 15, color: '#555', display: 'block', marginBottom: '4px' }}>订单状态通知</Text>
                    <Text style={{ fontSize: 12, color: '#999' }}>车辆到达、行程开始、支付完成等通知</Text>
                  </View>
                  <Switch 
                    checked={settings.notifications.orderUpdates}
                    onChange={() => toggleSetting('notifications', 'orderUpdates')}
                    color="#1976d2"
                  />
                </View>
                
                <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View>
                    <Text style={{ fontSize: 15, color: '#555', display: 'block', marginBottom: '4px' }}>促销活动通知</Text>
                    <Text style={{ fontSize: 12, color: '#999' }}>优惠券、折扣活动等通知</Text>
                  </View>
                  <Switch 
                    checked={settings.notifications.promotions}
                    onChange={() => toggleSetting('notifications', 'promotions')}
                    color="#1976d2"
                  />
                </View>
                
                <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View>
                    <Text style={{ fontSize: 15, color: '#555', display: 'block', marginBottom: '4px' }}>账户安全通知</Text>
                    <Text style={{ fontSize: 12, color: '#999' }}>登录异常、密码修改等通知</Text>
                  </View>
                  <Switch 
                    checked={settings.notifications.accountSecurity}
                    onChange={() => toggleSetting('notifications', 'accountSecurity')}
                    color="#1976d2"
                  />
                </View>
              </View>
            </View>

            {/* 隐私设置卡片 */}
            <View style={{ 
              background: '#fff', 
              borderRadius: '16px', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)', 
              padding: '25px'
            }}>
              <Text style={{ 
                fontSize: 18, 
                fontWeight: 'bold', 
                marginBottom: '20px', 
                color: '#333',
                display: 'block',
                paddingBottom: '10px',
                borderBottom: '1px solid #f0f0f0'
              }}>
                隐私设置
              </Text>
              
              <View style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View>
                    <Text style={{ fontSize: 15, color: '#555', display: 'block', marginBottom: '4px' }}>向车主显示我的头像</Text>
                    <Text style={{ fontSize: 12, color: '#999' }}>车主在接单时可以看到您的头像</Text>
                  </View>
                  <Switch 
                    checked={settings.privacy.showProfileToDrivers}
                    onChange={() => toggleSetting('privacy', 'showProfileToDrivers')}
                    color="#1976d2"
                  />
                </View>
                
                <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View>
                    <Text style={{ fontSize: 15, color: '#555', display: 'block', marginBottom: '4px' }}>行程结束后分享行程信息</Text>
                    <Text style={{ fontSize: 12, color: '#999' }}>与紧急联系人分享您的行程信息</Text>
                  </View>
                  <Switch 
                    checked={settings.privacy.shareRideInfo}
                    onChange={() => toggleSetting('privacy', 'shareRideInfo')}
                    color="#1976d2"
                  />
                </View>
                
                <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View>
                    <Text style={{ fontSize: 15, color: '#555', display: 'block', marginBottom: '4px' }}>位置信息权限</Text>
                    <Text style={{ fontSize: 12, color: '#999' }}>允许应用访问您的位置信息</Text>
                  </View>
                  <Text style={{ color: '#4caf50', fontSize: 14 }}>已开启</Text>
                </View>
                
                <View style={{ display: 'flex', justifyContent: 'space-between',  alignItems: 'center', // 可添加适当的内边距让布局更美观
                              paddingVertical: 8,
                              paddingHorizontal: 12}}>
  <View>
    <Text style={{ 
      fontSize: 15, 
      color: '#555', 
      marginBottom: 4,
      fontWeight: '500' // 稍微加粗主标题
    }}>个性化推荐设置</Text>
    <Text style={{ 
      fontSize: 12, 
      color: '#999',
      whiteSpace: 'nowrap' // 强制文本在一行显示
    }}>根据您的偏好推荐路线和服务</Text>
  </View>
  <Button 
    style={{
      ...settingsButtonStyle,
      ...(settingsButtonHover.privacyManage ? settingsButtonHoverStyle : {}),
      // 缩小按钮尺寸
      paddingHorizontal: 12, // 减少水平内边距
      paddingVertical: 4,    // 减少垂直内边距
      fontSize: 12,          // 减小字体大小
      height: 28             // 降低按钮高度
    }}
    onMouseEnter={() => handleSettingsButtonHover('privacyManage', true)}
    onMouseLeave={() => handleSettingsButtonHover('privacyManage', false)}
  >管理</Button>
</View>

              </View>
            </View>

            {/* 支付与通用设置卡片 */}
            <View style={{ 
              background: '#fff', 
              borderRadius: '16px', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)', 
              padding: '25px'
            }}>
              <Text style={{ 
                fontSize: 18, 
                fontWeight: 'bold', 
                marginBottom: '20px', 
                color: '#333',
                display: 'block',
                paddingBottom: '10px',
                borderBottom: '1px solid #f0f0f0'
              }}>
                支付与通用设置
              </Text>
              
              <View style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
  <Text style={{ fontSize: 15, color: '#555' }}>默认支付方式</Text>
  <View style={{ display: 'flex', gap: '10px' }}>
    <Button 
      style={{
        background: settings.payment.defaultMethod === 'alipay' ? '#1976d2' : '#f5f5f5',
        color: settings.payment.defaultMethod === 'alipay' ? '#fff' : '#555',
        border: 'none',
        borderRadius: '6px',
        padding: '6px 15px',
        fontSize: 13,
        height: '32px',
        lineHeight: '20px',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        whiteSpace: 'nowrap', // 防止文本换行
        minWidth: '80px' // 确保有足够宽度容纳文字
      }}
      onClick={() => changePaymentMethod('alipay')}
    >
      支付宝
    </Button>
    <Button 
      style={{
        background: settings.payment.defaultMethod === 'wechat' ? '#1976d2' : '#f5f5f5',
        color: settings.payment.defaultMethod === 'wechat' ? '#fff' : '#555',
        border: 'none',
        borderRadius: '6px',
        padding: '6px 15px',
        fontSize: 13,
        height: '32px',
        lineHeight: '20px',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        whiteSpace: 'nowrap', // 关键：强制文本在一行显示
        minWidth: '80px' // 确保按钮有足够宽度
      }}
      onClick={() => changePaymentMethod('wechat')}
    >
      微信支付
    </Button>
  </View>
</View>
                
                <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View>
                    <Text style={{ fontSize: 15, color: '#555', display: 'block', marginBottom: '4px' }}>保存支付方式</Text>
                    <Text style={{ fontSize: 12, color: '#999' }}>记住您的支付方式以便快速支付</Text>
                  </View>
                  <Switch 
                    checked={settings.payment.saveCards}
                    onChange={() => toggleSetting('payment', 'saveCards')}
                    color="#1976d2"
                  />
                </View>
      
                <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View>
                    <Text style={{ fontSize: 15, color: '#555', display: 'block', marginBottom: '4px' }}>清除缓存</Text>
                    <Text style={{ fontSize: 12, color: '#999' }}>当前缓存: {settings.cacheSize}</Text>
                  </View>
                  <Button 
                    style={{
                      ...settingsButtonStyle,
                      color: '#f44336',
                      borderColor: '#f44336',
                      ...(settingsButtonHover.clearCache ? {
                        background: '#f44336',
                        color: '#fff',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 2px 5px rgba(244, 67, 54, 0.3)'
                      } : {})
                    }}
                    onClick={clearCache}
                    onMouseEnter={() => handleSettingsButtonHover('clearCache', true)}
                    onMouseLeave={() => handleSettingsButtonHover('clearCache', false)}
                  >
                    清除缓存
                  </Button>
                </View>
              </View>
            </View>

            {/* 关于我们卡片 */}
            <View style={{ 
              background: '#fff', 
              borderRadius: '16px', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)', 
              padding: '25px'
            }}>
              <Text style={{ 
                fontSize: 18, 
                fontWeight: 'bold', 
                marginBottom: '20px', 
                color: '#333',
                display: 'block',
                paddingBottom: '10px',
                borderBottom: '1px solid #f0f0f0'
              }}>
                关于我们
              </Text>
              
              <View style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 15, color: '#555' }}>当前版本</Text>
                  <Text style={{ fontSize: 14, color: '#666' }}>v0.0.0</Text>
                </View>
                
                <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 15, color: '#555' ,whiteSpace: 'nowrap'}}>用户协议 </Text>
                  <Button 
                    style={{
                      ...settingsButtonStyle,
                      ...(settingsButtonHover.userAgreement ? settingsButtonHoverStyle : {})
                    }}
                    onMouseEnter={() => handleSettingsButtonHover('userAgreement', true)}
                    onMouseLeave={() => handleSettingsButtonHover('userAgreement', false)}
                  >查看</Button>
                </View>
                
                <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 15, color: '#555' ,whiteSpace: 'nowrap'}}>隐私政策 </Text>
                  <Button 
                    style={{
                      ...settingsButtonStyle,
                      ...(settingsButtonHover.privacyPolicy ? settingsButtonHoverStyle : {})
                    }}
                    onMouseEnter={() => handleSettingsButtonHover('privacyPolicy', true)}
                    onMouseLeave={() => handleSettingsButtonHover('privacyPolicy', false)}
                  >查看</Button>
                </View>
                
                <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 15, color: '#555' ,whiteSpace: 'nowrap'}}>检查更新 </Text>
                  <Button 
                    style={{
                      ...settingsButtonStyle,
                      background: '#1976d2',
                      color: '#fff',
                      border: 'none',
                      ...(settingsButtonHover.checkUpdate ? {
                        background: '#1565c0',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 2px 5px rgba(25, 118, 210, 0.3)'
                      } : {})
                    }}
                    onMouseEnter={() => handleSettingsButtonHover('checkUpdate', true)}
                    onMouseLeave={() => handleSettingsButtonHover('checkUpdate', false)}
                  >检查新版本</Button>
                </View>
                
                <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 15, color: '#555' ,whiteSpace: 'nowrap'}}>客服中心 </Text>
                  <Button 
                    style={{
                      ...settingsButtonStyle,
                      ...(settingsButtonHover.contactService ? settingsButtonHoverStyle : {})
                    }}
                    onMouseEnter={() => handleSettingsButtonHover('contactService', true)}
                    onMouseLeave={() => handleSettingsButtonHover('contactService', false)}
                  >联系客服</Button>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* 底部提示 */}
        <View style={{ 
          textAlign: 'center', 
          color: '#999', 
          fontSize: 13, 
          marginTop: 40,
          paddingTop: 25,
          borderTop: '1px solid #eee',
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          <View style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 15 }}>
            <Text style={{ cursor: 'pointer', ':hover': { color: '#1976d2' } }}>关于我们</Text>
            <Text style={{ cursor: 'pointer', ':hover': { color: '#1976d2' } }}>用户协议</Text>
            <Text style={{ cursor: 'pointer', ':hover': { color: '#1976d2' } }}>隐私政策</Text>
            <Text style={{ cursor: 'pointer', ':hover': { color: '#1976d2' } }}>帮助中心</Text>
          </View>
          打车出行 · 安全 · 便捷 · 优质服务<br />
          <Text className="phone-animate" style={{ 
            color: '#1976d2', 
            fontWeight: 'bold',
            fontSize: 14,
            marginTop: 8,
            display: 'inline-block',
            animation: 'pulse 1.5s infinite'
          }}>客服电话：400-123-4567</Text>
        </View>
      </View>
    </View>
  );
}