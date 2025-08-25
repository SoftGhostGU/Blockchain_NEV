import { useEffect, useState } from 'react';
import './UserInfo.scss';

import { ConfigProvider, Flex, Input, theme, Tooltip } from 'antd';
import { useColorModeStore } from '../../store/store';

const UserInfo = () => {
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

  const handleEditClick = () => {
    if (isEditing) {
      // 保存编辑
      setUserData(tempData);
    } else {
      // 进入编辑模式
      setTempData(userData);
    }
    setIsEditing(!isEditing);
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
  };

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
            >
              {isEditing ? '保存' : '编辑'}
            </button>
            {isEditing && (
              <button
                className="cancel-button"
                onClick={handleCancel}
              >
                取消
              </button>
            )}
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default UserInfo;