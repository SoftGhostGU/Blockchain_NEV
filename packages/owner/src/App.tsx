import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import Login from './pages/Login'
import MainLayout from './layouts/MainLayout';
import CarInfo from './pages/carInfo';
import Earnings from './pages/benefit';
import Orders from './pages/orderManage';
import Settings from './pages/userInfo'
import './App.css';
// import 'antd/dist/antd.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        {/* <Route path="/dashboard" element={<MainLayout />}>
          <Route path="/dashboard/vehicles" element={<CarInfo />} />
          <Route path="/dashboard/earnings" element={<Earnings />} />
          <Route path="/dashboard/orders" element={<Orders />} />
          <Route path="/dashboard/settings" element={<Settings />} />
        </Route> */}
        <Route path="/dashboard/*" element={<MainLayout />} />
      </Routes>
    </Router>
  );
}

export default App;
