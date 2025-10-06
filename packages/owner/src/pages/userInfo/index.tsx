import { useEffect, useState } from 'react';
import './index.scss';

import { ConfigProvider, Input, theme, Tooltip, message } from 'antd'; // 添加 message 导入
import { useColorModeStore } from '../../store/store';
import { useNavigate } from 'react-router-dom';
import request from '../../api';

const UserInfo = () => {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage(); // 创建 message 实例
  
  // 初始用户数据
  const initialUserData = {
    id: '',
    name: '',
    phone: '',
    registrationTime: '',
    bankCard: '',
  };

  const [userData, setUserData] = useState(initialUserData);
  const [isEditing, setIsEditing] = useState(false);
  const [tempData, setTempData] = useState(initialUserData);
  const [isSaving, setIsSaving] = useState(false); // 添加保存状态
  const [loading, setLoading] = useState(true); // 添加加载状态

  // 格式化日期时间函数
  const formatDateTime = (dateTimeStr: string): string => {
    if (!dateTimeStr) return '';
    
    try {
      const date = new Date(dateTimeStr);
      if (isNaN(date.getTime())) return dateTimeStr;
      
      // 格式化为：YYYY-MM-DD HH:mm:ss
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    } catch (error) {
      console.warn('日期格式化失败:', error);
      return dateTimeStr;
    }
  };

  const handleEditClick = async () => {
    if (isEditing) {
      // 保存编辑
      setIsSaving(true);
      try {
        // 调用更新用户信息API（PUT请求）
        const response = await request.updateProfile({
          username: tempData.name,
          phone: tempData.phone,
          bankCard: tempData.bankCard
        });
        
        if (response && response.data) {
          setUserData(tempData);
          setIsEditing(false);
          
          // 显示成功消息
          messageApi.success('保存成功！');
          console.log('用户信息更新成功:', response.data);
        } else {
          throw new Error('API响应异常');
        }
      } catch (error) {
        // 显示错误消息
        messageApi.error('保存失败，请重试');
        console.error('保存失败:', error);
      } finally {
        setIsSaving(false);
      }
    } else {
      // 进入编辑模式
      setTempData(userData);
      setIsEditing(!isEditing);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    setTempData({
      ...tempData,
      [field]: e.target.value
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    // 恢复原始数据
    setTempData(userData);
    // 显示取消消息（可选）
    messageApi.info('已取消编辑');
  };

  const handleLogOut = () => {
    // 删除登录数据（待完成）
    console.log('退出登录');
    
    // 显示退出消息
    messageApi.success('退出登录成功');
    
    // 跳转到首页
    setTimeout(() => {
      navigate('/');
    }, 1000);
  }

  const isNightMode = useColorModeStore(state => state.isNightMode);
  
  // 获取用户信息
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await request.getProfile({});
        
        if (response && response.data) {
          // 调试：打印API响应数据
          console.log('API响应数据:', response.data);
          
          // 映射API返回数据到前端格式
          const apiData = response.data;
          const mappedData = {
            id: apiData.userId || apiData.id || '',
            name: apiData.username || apiData.name || '',
            phone: apiData.phoneNumber || apiData.phone || '',
            registrationTime: formatDateTime(apiData.createdAt || apiData.updatedAt || ''),
            bankCard: apiData.bankCard || '',
          };
          
          // 调试：打印映射后的数据
          console.log('映射后的用户数据:', mappedData);
          
          setUserData(mappedData);
          setTempData(mappedData);
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
        messageApi.error('获取用户信息失败');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // 昼夜模式应用函数
  const applyNightModeClasses = () => {
    const userInfoItem = document.querySelector('.user-info-item');
    const userInfoTitle = document.querySelector('.user-info-title');
    const fieldLabel = document.querySelectorAll('.field-label');
    const fieldValue = document.querySelectorAll('.field-value');
    
    if (isNightMode) {
      userInfoItem?.classList.add('night-mode');
      userInfoTitle?.classList.add('night-mode');
      fieldLabel.forEach(label => label.classList.add('night-mode'));
      fieldValue.forEach(value => value.classList.add('night-mode'));
    } else {
      userInfoItem?.classList.remove('night-mode');
      userInfoTitle?.classList.remove('night-mode');
      fieldLabel.forEach(label => label.classList.remove('night-mode'));
      fieldValue.forEach(value => value.classList.remove('night-mode'));
    }
  };

  // 主要应用逻辑 - 响应昼夜模式变化
  useEffect(() => {
    applyNightModeClasses();
  }, [isNightMode, isEditing]);

  // 页面加载时强制应用昼夜模式 - 解决初始化问题
  useEffect(() => {
    // 立即应用一次
    applyNightModeClasses();
    
    // DOM完全渲染后多次应用
    const timer1 = setTimeout(applyNightModeClasses, 100);
    const timer2 = setTimeout(applyNightModeClasses, 300);
    const timer3 = setTimeout(applyNightModeClasses, 500);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <ConfigProvider
      theme={{ algorithm: isNightMode ? theme.darkAlgorithm : theme.defaultAlgorithm }}
    >
      {/* 添加 contextHolder */}
      {contextHolder}
      
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <div className='user-info-container'>
          {loading ? (
            <div className="loading-container">
              <div className="loading-text">正在加载用户信息...</div>
            </div>
          ) : (
            <>
              <div className='welcome-title'>欢迎！<div className='user-name'>{userData.name}</div></div>
              <div className='user-info-item'>
                <h2 className="user-info-title">您的信息</h2>

            <div className="user-info-field">
              <span className="field-label">ID</span>
              <span className="field-value">{userData.id}</span>
            </div>

            <div className="user-info-field">
              <span className="field-label">姓名</span>
              {isEditing ? (
                <Input
                  type="text"
                  variant="filled"
                  value={tempData.name}
                  onChange={(e) => handleInputChange(e, 'name')}
                  className="edit-Input"
                />
              ) : (
                <span className="field-value">{userData.name}</span>
              )}
            </div>

            <div className="user-info-field">
              <span className="field-label">手机号</span>
              {isEditing ? (
                <Input
                  type="text"
                  variant="filled"
                  value={tempData.phone}
                  onChange={(e) => handleInputChange(e, 'phone')}
                  className="edit-Input"
                />
              ) : (
                <span className="field-value">{userData.phone}</span>
              )}
            </div>

            <div className="user-info-field">
              <span className="field-label">注册时间</span>
              {isEditing ? (
                <Tooltip
                  title="注册时间不可更改"
                  placement="right"
                >
                  <Input
                    type="text"
                    variant="filled"
                    disabled={true}
                    value={tempData.registrationTime}
                    onChange={(e) => handleInputChange(e, 'registrationTime')}
                    className="edit-input"
                    color={isNightMode ? 'white' : 'black'}
                  />
                </Tooltip>
              ) : (
                <span className="field-value">{userData.registrationTime}</span>
              )}
            </div>

            <div className="user-info-field">
              <span className="field-label">银行卡号</span>
              {isEditing ? (
                <Input
                  type="text"
                  variant="filled"
                  value={tempData.bankCard}
                  onChange={(e) => handleInputChange(e, 'bankCard')}
                  className="edit-Input"
                  placeholder="请输入银行卡号"
                />
              ) : (
                <span className="field-value">
                  {userData.bankCard ? 
                    `************${userData.bankCard.slice(-4)}` : 
                    '未设置'
                  }
                </span>
              )}
            </div>

            <div className="button-group">
              <button
                className={`edit-button ${isEditing ? 'save-button' : ''}`}
                onClick={handleEditClick}
                disabled={isSaving} // 禁用按钮防止重复点击
              >
                {isSaving ? '保存中...' : (isEditing ? '保存' : '编辑')}
              </button>
              {isEditing && (
                <button
                  className="cancel-button"
                  onClick={handleCancel}
                  disabled={isSaving} // 禁用按钮防止重复点击
                >
                  取消
                </button>
              )}
              {!isEditing && (
                <button
                  className="log-out-button"
                  onClick={handleLogOut}
                >
                  退出登录
                </button>
              )}
              </div>
            </div>
            </>
          )}
        </div>
      </div>
    </ConfigProvider>
  );
};

export default UserInfo;