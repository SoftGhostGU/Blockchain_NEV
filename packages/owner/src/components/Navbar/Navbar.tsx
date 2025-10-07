import './Navbar.scss';
import logo from '../../assets/logo1.png';
import { useColorModeStore } from '../../store/store';
import request from '../../api';
import NotificationTooltip from '../NotificationTooltip';
import DrawerComponent from '../Drawer';
import { Badge, Button, ConfigProvider, Drawer, Menu, Space, theme, Tooltip, message } from 'antd';
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
import { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

type MenuItem = Required<MenuProps>['items'][number];

export default function Navbar({ onMenuSelect }: { onMenuSelect?: (key: string) => void }) {
  const [apiOrders, setApiOrders] = useState<any[]>([]);
  const [vehicleData, setVehicleData] = useState<any>(null);

  // 获取车辆状态数据
  useEffect(() => {
    const fetchVehicleData = async () => {
      try {
        // 假设车辆ID为4000，根据实际情况调整
        const response = await request.getVehicleInfo({ vehicleId: '4000' });
        console.log('车辆状态响应:', response);
        
        if (response && response.data) {
          // 状态映射函数 - 将数字状态转换为字符串
          const mapStatus = (status: number): string => {
            const statusMap: Record<number, string> = {
              1: '正常',
              2: '注意', 
              3: '危险'
            };
            return statusMap[status] || '未知状态';
          };

          // 映射API响应到表单字段
          const mappedVehicleData = {
            vehicleModel: response.data.vehicleModel || '未知型号',
            licensePlate: response.data.licensePlate || '未知车牌',
            bodyStatus: mapStatus(response.data.bodyState) || '未知状态',
            tirePressure: mapStatus(response.data.tirePressure) || '未知状态',
            brakeSystem: mapStatus(response.data.brakeState) || '未知状态',
            powerSystem: mapStatus(response.data.powerState) || '未知状态',
            remark: response.data.remark || '暂无备注信息'
          };
          setVehicleData(mappedVehicleData);
        }
      } catch (error) {
        console.error('获取车辆状态失败:', error);
        // 使用默认数据
        setVehicleData({
          vehicleModel: '未知型号',
          licensePlate: '未知车牌',
          bodyStatus: '正常',
          tirePressure: '正常',
          brakeSystem: '正常',
          powerSystem: '正常',
          remark: '暂无备注信息'
        });
      }
    };

    fetchVehicleData();
  }, []);

  // 获取订单历史数据
  useEffect(() => {
    const fetchOrderHistory = async () => {
      try {
        const response = await request.orderHistory({});
        console.log('订单历史响应:', response);
        
        if (response && response.data && response.data.data) {
          setApiOrders(response.data.data);
        } else if (response && response.data) {
          // 如果data直接是数组（兼容不同响应格式）
          setApiOrders(Array.isArray(response.data) ? response.data : []);
        } else {
          setApiOrders([]);
        }
      } catch (error) {
        console.error('获取订单历史失败:', error);
        // 使用默认数据作为fallback
        setApiOrders([]);
      }
    };

    fetchOrderHistory();
  }, []);

  // 字段映射函数 - 将API响应转换为前端需要的格式
  const mapApiOrderToFrontend = (apiOrder: any) => {
    // 状态映射
    const statusMap: Record<number, string> = {
      1: '进行中',
      2: '已完成', 
      3: '已完成',
      4: '失败'
    };

    return {
      orderId: apiOrder.orderId,
      orderTime: apiOrder.createdAt ? new Date(apiOrder.createdAt).toLocaleString('zh-CN') : '未知时间',
      orderType: apiOrder.type || '未知类型',
      balance: `+￥${apiOrder.actualPrice || apiOrder.estimatedPrice || 0}`,
      status: statusMap[apiOrder.status] || '未知状态',
      startLocation: apiOrder.startLocation,
      endLocation: apiOrder.destination, // API返回的是destination字段
      username: apiOrder.user?.username || '未知用户',
      commentStar: apiOrder.review?.commentStar || 0,
      commentText: apiOrder.review?.content || ''
    };
  };

  // 使用API数据或默认数据
  const orders = useMemo(() => {
    if (apiOrders.length > 0) {
      return apiOrders.map(mapApiOrderToFrontend);
    }
    
    // API数据为空时的默认数据
    return [
      {
        orderId: 'ORD20250717001',
        orderTime: '2025-07-17 10:00:00',
        orderType: '网约车',
        balance: '+￥180',
        status: '已完成',
        startLocation: '北京市朝阳区三里屯',
        endLocation: '北京市海淀区中关村',
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
        startLocation: '北京市朝阳区三里屯',
        endLocation: '北京市海淀区中关村',
        username: '张俊喆',
        commentStar: 5,
        commentText: '非常好，车子开的很稳，路上没有堵车，车主服务态度很好，很快就送达，很满意！',
      }
    ];
  }, [apiOrders]);

  const [selectedKey, setSelectedKey] = useState('0');
  const [openDrawer, setOpenDrawer] = useState(false);
  const drawerFormRef = useRef<any>(null);

  const showDrawer = () => {
    setOpenDrawer(true);
  };

  const onClose = () => {
    setOpenDrawer(false);
  };

  const handleFormSubmit = (formData: any) => {
    console.log('表单提交数据:', formData);
    // 这里可以添加API调用或其他处理逻辑
    setOpenDrawer(false);
    message.success('车辆信息已更新');
  };

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

  const [name, setName] = useState('ZHANGSAN');
  const [unreadOrders, setUnreadOrders] = useState<any[]>([]);
  
  // 获取用户信息
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await request.getProfile({});
        console.log('用户信息响应:', response);
        
        if (response && response.data) {
          const userData = response.data;
          // 使用data.driver.username字段
          const username = userData.driver?.username || userData.username || '未知用户';
          setName(username);
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
        // 保持默认用户名
      }
    };

    fetchUserProfile();
  }, []);

  // 获取最新阅读时间戳
  const getLatestReadTimestamp = (): number => {
    if (typeof window === 'undefined') return 0;
    return parseInt(localStorage.getItem('latest_read_timestamp') || '0');
  };

  // 标记订单为已读
  const markOrderAsRead = (orderId: string) => {
    if (typeof window === 'undefined') return;
    
    // 存储当前时间戳作为最新阅读时间
    localStorage.setItem('latest_read_timestamp', Date.now().toString());
    // 更新未读订单列表
    setUnreadOrders(prev => prev.filter(order => order.orderId !== orderId));
  };

  // 标记所有订单为已读
  const markAllOrdersAsRead = () => {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem('latest_read_timestamp', Date.now().toString());
    setUnreadOrders([]);
  };

  // 筛选未读订单 - 基于时间戳判断
  useEffect(() => {
    const latestReadTimestamp = getLatestReadTimestamp();
    
    if (latestReadTimestamp === 0) {
      // 如果没有阅读记录，显示所有订单
      setUnreadOrders(orders);
      return;
    }

    // 过滤出创建时间晚于最新阅读时间的订单
    const filteredUnreadOrders = orders.filter(order => {
      // 将订单时间转换为时间戳进行比较
      const orderTimestamp = new Date(order.orderTime).getTime();
      return orderTimestamp > latestReadTimestamp;
    });
    
    setUnreadOrders(filteredUnreadOrders);
  }, [orders]); // orders现在有稳定引用
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
  ];

  return (
    <ConfigProvider
      theme={{ algorithm: isNightMode ? theme.darkAlgorithm : theme.defaultAlgorithm }}
    >
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
              alt="Logo"
            />
            <div className='title'>AutoCrowd</div>
          </div>

          <div className='right-bar'>
            <Tooltip
              trigger="hover"
              placement="bottomRight"
              color={isNightMode ? '#1f2937' : '#ffffff'}
              styles={{
                body: {
                  padding: 12,
                  minWidth: 320,
                  maxWidth: 420,
                  color: isNightMode ? '#f9fafb' : '#111827'
                }
              }}
              title={<NotificationTooltip orders={unreadOrders} onMarkAsRead={markOrderAsRead} onMarkAllAsRead={markAllOrdersAsRead} />}
            >
              <Badge count={unreadOrders.length} overflowCount={10} offset={[-20, 20]} size="small">
                <BellOutlined className='icon' />
              </Badge>
            </Tooltip>
            <Tooltip title="修改车辆信息">
              <CarOutlined className='icon' onClick={showDrawer} />
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
                setSelectedKey(key);
                onMenuSelect?.(key);
              }}
            />
          </div>
        </div>
      </div>
      <Drawer
        title="修改车辆信息"
        width={720}
        onClose={onClose}
        open={openDrawer}
        styles={{
          header: {
            backgroundColor: isNightMode ? '#1f2937' : '#ffffff',
            color: isNightMode ? '#f9fafb' : '#111827',
          },
          body: {
            paddingBottom: 80,
          },
          mask: {
            backdropFilter: 'blur(10px)',
          },
        }}
        extra={
          <Space>
            <Button onClick={onClose}>取消</Button>
            <Button 
              onClick={() => {
                if (drawerFormRef.current) {
                  drawerFormRef.current.submit();
                }
              }} 
              type="primary"
            >
              提交
            </Button>
          </Space>
        }
      >
        <DrawerComponent ref={drawerFormRef} onSubmit={handleFormSubmit} vehicleData={vehicleData} />
      </Drawer>
    </ConfigProvider>
  );
}