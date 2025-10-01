// API 连接测试工具
import request from './request/request';

export const testApiConnection = async () => {
  try {
    console.log('🔍 开始测试 API 连接...');
    console.log('📍 API Base URL:', window.envConfig?.API_BASE_URL);
    console.log('🔧 代理模式:', window.envConfig?.proxy ? '开启' : '关闭');
    
    // 测试基础连接
    const response = await fetch('/api/driver/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: 'test',
        password: 'test'
      })
    });
    
    console.log('📡 响应状态:', response.status);
    // console.log('📡 响应头:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.text();
    console.log('📡 响应数据:', data);
    
    return {
      success: response.ok,
      status: response.status,
      data: data
    };
  } catch (error) {
    console.error('❌ API 连接测试失败:', error);
    return {
      success: false,
      error: error
    };
  }
};

export const testRegisterApi = async (params: any) => {
  try {
    console.log('🔍 测试注册 API...');
    console.log('📤 请求参数:', params);
    
    const response = await fetch('/api/driver/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params)
    });
    
    console.log('📡 注册响应状态:', response.status);
    const data = await response.json();
    console.log('📡 注册响应数据:', data);
    
    return data;
  } catch (error) {
    console.error('❌ 注册 API 测试失败:', error);
    throw error;
  }
};