import { useState } from 'react';
import Navbar from '../components/Navbar';
import CarInfo from '../pages/carInfo/carInfo';
import Benefit from '../pages/benefit/benefit';
import OrderManage from '../pages/orderManage/orderManage';

export default function MainLayout() {
  const [activePage, setActivePage] = useState('1');

  const renderContent = () => {
    switch (activePage) {
      case '1': return <CarInfo />;
      case '2': return <Benefit />;
      case '3': return <OrderManage />;
      default: return <div>Not Found</div>;
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