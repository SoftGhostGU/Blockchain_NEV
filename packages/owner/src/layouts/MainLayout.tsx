import { useState } from 'react';
import Navbar from '../components/Navbar/Navbar';
import AutoCrowd from '../pages/AutoCrowd/AutoCrowd';
import CarInfo from '../pages/carInfo/carInfo';
import Benefit from '../pages/benefit/benefit';
import OrderManage from '../pages/orderManage/orderManage';
import NotFound from '../pages/notFound/notFound'

export default function MainLayout() {
  const [activePage, setActivePage] = useState('0');

  const renderContent = () => {
    switch (activePage) {
      case '0': return <AutoCrowd />;
      case '1': return <CarInfo />;
      case '2': return <Benefit />;
      case '3': return <OrderManage />;
      default: return <NotFound />;
    }
  };

  return (
    <div className="main-layout">
      <Navbar onMenuSelect={setActivePage} />
      <main style={{ marginLeft: '16%' }}>
        {renderContent()}
      </main>
    </div>
  );
}