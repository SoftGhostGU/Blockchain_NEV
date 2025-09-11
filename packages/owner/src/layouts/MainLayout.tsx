import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';
import AutoCrowd from '../pages/AutoCrowd';
import CarInfo from '../pages/carInfo';
import Benefit from '../pages/benefit';
import OrderManage from '../pages/orderManage';
import UserInfo from '../pages/userInfo';
import NotFound from '../pages/notFound/notFound';

export default function MainLayout() {
  const [activePage, setActivePage] = useState('0');
  const navigate = useNavigate();
  const location = useLocation();

  // 建立页面key和路由路径的映射
  const pageToRouteMap: Record<string, string> = {
    '0': '/dashboard',
    '1': '/dashboard/vehicles',
    '2': '/dashboard/earnings', 
    '3': '/dashboard/orders',
    '4': '/dashboard/settings'
  };

  const routeToPageMap: Record<string, string> = {
    '/dashboard': '0',
    '/dashboard/vehicles': '1',
    '/dashboard/earnings': '2',
    '/dashboard/orders': '3',
    '/dashboard/settings': '4'
  };

  // 根据URL变化更新activePage
  useEffect(() => {
    const currentPath = location.pathname;
    const pageKey = routeToPageMap[currentPath];
    
    if (pageKey && pageKey !== activePage) {
      setActivePage(pageKey);
    }
  }, [location.pathname]);

  // 处理菜单选择，同时更新URL
  const handleMenuSelect = (key: string) => {
    setActivePage(key);
    const route = pageToRouteMap[key];
    if (route) {
      navigate(route);
    }
  };

  const renderContent = () => {
    switch (activePage) {
      case '0': return <AutoCrowd />;
      case '1': return <CarInfo />;
      case '2': return <Benefit />;
      case '3': return <OrderManage />;
      case '4': return <UserInfo />;
      default: return <NotFound />;
    }
  };

  return (
    <div className="main-layout">
      <Navbar onMenuSelect={handleMenuSelect} />
      <main style={{ marginLeft: '16%' }}>
        {renderContent()}
      </main>
    </div>
  );
}