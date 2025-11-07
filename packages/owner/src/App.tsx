import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Index from './pages/Index';
import Login from './pages/Login'
import MainLayout from './layouts/MainLayout';
import AddVehicle from './pages/AddVehicle';
import './App.css';
import { isMobileDevice, MobileWarning } from './utils/deviceDetector.tsx';

// 包装组件，用于检测每个路由是否需要在移动端显示警告
const RouteWithDeviceCheck: React.FC<{
  element: React.ReactNode;
  isIndex?: boolean;
}> = ({ element, isIndex = false }) => {
  const [mobile, setMobile] = useState(false);
  
  useEffect(() => {
    // 检测设备类型
    const isMobile = isMobileDevice();
    setMobile(isMobile);
    
    // 添加窗口大小变化监听
    const handleResize = () => {
      setMobile(isMobileDevice());
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // 如果是移动端且不是Index页面，则显示警告
  if (mobile && !isIndex) {
    return <MobileWarning />;
  }
  
  return element as React.ReactElement;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RouteWithDeviceCheck element={<Index />} isIndex={true} />} />
        <Route path="/login" element={<RouteWithDeviceCheck element={<Login />} />} />
        <Route path="/add-vehicle" element={<RouteWithDeviceCheck element={<AddVehicle />} />} />
        <Route path="/dashboard/*" element={<RouteWithDeviceCheck element={<MainLayout />} />} />
      </Routes>
    </Router>
  );
}

export default App;
