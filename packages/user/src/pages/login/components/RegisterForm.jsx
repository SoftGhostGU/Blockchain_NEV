import { View, Input, Button, Text } from '@tarojs/components';
import { useState } from 'react';
import '../index.scss';
import { register } from '../../../utils/auth';
import { formErrorToaster } from '../../../utils/error';
import { Spin } from 'antd';
import { EyeOutlined, EyeInvisibleOutlined, LoadingOutlined } from '@ant-design/icons';

// 注册页面（简化版）：移除邮箱验证码两步流程，改为一次提交。
// 表单字段：手机号 + 用户名 + 密码 + 确认密码。
// 成功后由 auth.register 统一保存 token 与用户信息，并跳转到主页面。

const RegisterForm = ({ onBackToLogin }) => {
  const [loadingRegister, setLoadingRegister] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    username: '',
    password: '',
    checkPassword: '',
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 基础本地校验：手机号格式、用户名长度、密码一致性
  const validateForm = () => {
    const phoneReg = /^1\d{10}$/;
    if (!phoneReg.test(formData.phone)) {
      throw new Error('请输入有效的手机号（11位数字，以1开头）');
    }
    if (!formData.username || formData.username.length < 3) {
      throw new Error('用户名至少需要3个字符');
    }
    if (!formData.password || formData.password.length < 6) {
      throw new Error('密码至少需要6个字符');
    }
    if (formData.password !== formData.checkPassword) {
      throw new Error('密码不一致！');
    }
  };

  // 已移除验证码输入与键盘处理逻辑（不再需要）
  
  const checkPassword = async () => {
    try {
      return await new Promise((resolve, reject) => {
        if (formData.checkPassword !== formData.password) {
          reject(new Error('密码不一致！'));
        } else {
          resolve();
        }
      });
    } catch (error) {
      return formErrorToaster(error);
    }
  };

  const handleSubmit = async () => {
    setLoadingRegister(true);
    try {
      // 1) 先做本地校验
      validateForm();
      // 2) 调用注册接口（内部已处理成功态的保存与跳转）
      await register({
        phone: formData.phone,
        username: formData.username,
        password: formData.password,
        checkPassword: formData.checkPassword,
      });
    } catch (error) {
      formErrorToaster(error);
    } finally {
      setLoadingRegister(false);
    }
  };
  
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  
  const togglePasswordVisible = () => {
    setPasswordVisible(!passwordVisible);
  };
  
  const toggleConfirmPasswordVisible = () => {
    setConfirmPasswordVisible(!confirmPasswordVisible);
  };
  
  const renderRegisterForm = () => (
    <>
      <View className="form-header">
        <Text className="title">创建账号</Text>
        <Text className="subtitle">请填写手机号、用户名与密码完成注册</Text>
      </View>
      <View className="input-group">
        <Input
          className="input-field"
          type="number"
          placeholder="请输入手机号"
          value={formData.phone}
          onInput={(e) => handleInputChange('phone', e.detail.value)}
        />
        <Input
          className="input-field"
          type="text"
          placeholder="请输入用户名"
          value={formData.username}
          onInput={(e) => handleInputChange('username', e.detail.value)}
        />
        <View className="password-input-container">
          <Input
            className="input-field"
            type={passwordVisible ? 'text' : 'password'}
            placeholder="请设置密码"
            value={formData.password}
            onInput={(e) => handleInputChange('password', e.detail.value)}
          />
          <View className="password-visible-button" onClick={togglePasswordVisible}>
            {passwordVisible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
          </View>
        </View>
        <View className="password-input-container">
          <Input
            className="input-field"
            type={confirmPasswordVisible ? 'text' : 'password'}
            placeholder="请确认密码"
            onBlur={checkPassword}
            value={formData.checkPassword}
            onInput={(e) => handleInputChange('checkPassword', e.detail.value)}
          />
          <View className="password-visible-button" onClick={toggleConfirmPasswordVisible}>
            {confirmPasswordVisible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
          </View>
        </View>
      </View>
      <Spin spinning={loadingRegister} indicator={<LoadingOutlined spin />} size="large">
        <Button className="next-button" onClick={handleSubmit} disabled={loadingRegister}>
          注册
          <View className="arrow-icon">→</View>
        </Button>
      </Spin>
    </>
  );
  
  // 已移除验证码步骤
  
  return (
    <View className="register-form">
      <View className="back-button" onClick={() => onBackToLogin()}>←</View>
      {renderRegisterForm()}
    </View>
  );
};

export default RegisterForm;