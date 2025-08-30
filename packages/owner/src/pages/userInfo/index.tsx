import { useEffect, useState } from 'react';
import './index.scss';

import { ConfigProvider, Input, theme, Tooltip, message } from 'antd'; // 添加 message 导入
import { useColorModeStore } from '../../store/store';
import { useNavigate } from 'react-router-dom';

const UserInfo = () => {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage(); // 创建 message 实例
  
  // 初始用户数据
  const initialUserData = {
    id: '2b58f25c-a5dc-4d43-874a-33fc91d09774',
    name: 'ZHANGSAN',
    phone: '13812345678',
    email: '3089308393@qq.com',
  };

  const [userData, setUserData] = useState(initialUserData);
  const [isEditing, setIsEditing] = useState(false);
  const [tempData, setTempData] = useState(initialUserData);
  const [isSaving, setIsSaving] = useState(false); // 添加保存状态

  const handleEditClick = async () => {
    if (isEditing) {
      // 保存编辑
      setIsSaving(true);
      try {
        // 模拟保存操作，这里替换为实际的API调用
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setUserData(tempData);
        setIsEditing(false);
        
        // 显示成功消息
        messageApi.success('保存成功！');
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
  
  useEffect(() => {
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
  }, [isNightMode, isEditing])

  return (
    <ConfigProvider
      theme={{ algorithm: isNightMode ? theme.darkAlgorithm : theme.defaultAlgorithm }}
    >
      {/* 添加 contextHolder */}
      {contextHolder}
      
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <div className='user-info-container'>
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
              <span className="field-label">电子邮箱</span>
              {isEditing ? (
                <Tooltip
                  title="邮箱不可更改，如需更改，请创建一个新用户"
                  placement="right"
                >
                  <Input
                    type="email"
                    variant="filled"
                    disabled={true}
                    value={tempData.email}
                    onChange={(e) => handleInputChange(e, 'email')}
                    className="edit-input"
                    color={isNightMode ? 'white' : 'black'}
                  />
                </Tooltip>
              ) : (
                <span className="field-value">{userData.email}</span>
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
        </div>
      </div>
    </ConfigProvider>
  );
};

export default UserInfo;