import React, { useState } from 'react';
import './index.scss';

import ownerHeader from '../../assets/login_owner.png'
import userHeader from '../../assets/login_user.png'
import { Navigate, useNavigate } from 'react-router-dom';
// #95caea  #f5d1d5

// 测试IBE使用
import TestIBE from '../../components/testIBE';

const Login: React.FC = () => {
  const navigate = useNavigate();

  const handleOwnerLogin = () => {
    console.log('车主登录');
    navigate('/login');
  };

  const handleUserLogin = () => {
    console.log('用户登录');
  };

  return (
    <div className="login-page">
      {/* <TestIBE /> */}
      <div className="login-box">
        <h2>车主登录</h2>
        <img className='owner-header' src={ownerHeader} alt="" />
        <button onClick={handleOwnerLogin}>点击跳转</button>
      </div>

      <div className="login-box">
        <h2>用户登录</h2>
        <img className='user-header' src={userHeader} alt="" />
        <button onClick={handleUserLogin}>点击跳转</button>
      </div>
    </div>
  );
};

export default Login;
