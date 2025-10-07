// src/utils/request.ts
import axios from "axios";
import { notification, Modal } from "antd";
import { encrypt } from '../IBE/encrypt';
import { decrypt } from '../IBE/decrypt';

// axios 实例
const request = axios.create({
  baseURL: window.envConfig.API_BASE_URL || "",
  timeout: (window.envConfig.API_BASE_TIMEOUT || 10) * 1000, // 秒转毫秒
  headers: {
    "Content-Type": "application/json; charset=utf-8",
  },
});

// 常见状态码提示
const codeMessage: Record<number, string> = {
  400: "请求参数错误",
  401: "未授权或登录过期",
  403: "禁止访问，没有权限",
  404: "请求的资源不存在",
  405: "请求方法不被允许",
  408: "请求超时",
  500: "服务器错误，请稍后再试",
  502: "网关错误",
  503: "服务不可用，服务器过载或维护中",
  504: "网关超时",
};

// 获取用户身份
const getUserIdentity = (): string | null => {
  try {
    const appInfo = localStorage.getItem("ROOT_APP_INFO");
    if (appInfo) {
      const parsedAppInfo = JSON.parse(appInfo);
      console.log('ROOT_APP_INFO内容:', parsedAppInfo);
      
      // 检查不同的用户信息结构
      if (parsedAppInfo.userInfo && parsedAppInfo.userInfo.driver_id) {
        // 新结构：userInfo包含driver_id
        return `DRIVER_${parsedAppInfo.userInfo.driver_id}`;
      } else if (parsedAppInfo.driverId) {
        // 备用结构：直接包含driverId
        return `DRIVER_${parsedAppInfo.driverId}`;
      } else if (parsedAppInfo.userInfo && parsedAppInfo.userInfo.driverId) {
        // 备用结构：userInfo包含driverId
        return `DRIVER_${parsedAppInfo.userInfo.driverId}`;
      }
    }
  } catch (error) {
    console.warn("获取用户身份失败:", error);
  }
  return null;
};

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    console.log('API请求开始:', config.url);
    
    const appInfo = localStorage.getItem("ROOT_APP_INFO");
    if (appInfo) {
      try {
        const { token } = JSON.parse(appInfo);
        if (token) {
          config.headers["Authorization"] = `Bearer ${token}`;
        }
      } catch (e) {
        console.warn("解析 ROOT_APP_INFO 出错:", e);
      }
    }
    
    // IBE加密：对请求数据中的敏感字段进行加密
    if (config.data && typeof config.data === 'object') {
      const userIdentity = getUserIdentity();
      console.log('用户身份:', userIdentity);
      if (userIdentity) {
        try {
          // 设置访问策略为当前用户身份
          const accessPolicy = `(${userIdentity})`;
          console.log('加密前数据:', config.data);
          config.data = encrypt(config.data, accessPolicy);
          console.log('加密后数据:', config.data);
        } catch (error) {
          console.warn("IBE加密失败:", error);
        }
      }
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    console.log('API响应收到:', response.config.url);
    console.log('响应状态:', response.status);
    console.log('原始响应数据:', response.data);
    
    const { data } = response;
    
    // IBE解密：对响应数据中的敏感字段进行解密
    if (data && typeof data === 'object') {
      const userIdentity = getUserIdentity();
      console.log('解密用户身份:', userIdentity);
      if (userIdentity) {
        try {
          // 尝试解密数组项
          if (Array.isArray(data.content)) {
            data.content = data.content.map((item: any) => {
              if (item && typeof item === 'object') {
                const decrypted = decrypt(item, userIdentity);
                return decrypted || item;
              }
              return item;
            });
          } else if (data && typeof data === 'object') {
            // 解密单个对象
            const decrypted = decrypt(data, userIdentity);
            console.log('解密后数据:', decrypted);
            if (decrypted) {
              Object.assign(data, decrypted);
            }
          }
        } catch (error) {
          console.warn("IBE解密失败:", error);
        }
      }
    }
    
    console.log('最终返回数据:', data);
    
    // 按后端约定：0 或 200 才算成功
    if (data && data.code !== 0 && data.code !== 200) {
      const errorText = data.message || codeMessage[data.code] || "未知错误";
      notification.error({
        message: "请求错误",
        description: errorText,
      });
    }
    return data;
  },
  (error) => {
    console.error('API请求错误:', error);
    
    if (error.message.includes("timeout")) {
      notification.error({
        message: "请求超时",
        description: "请检查网络或稍后再试",
      });
      return Promise.reject(error);
    }

    const { response } = error;
    if (response?.status) {
      const errorText = response.data?.message || codeMessage[response.status];
      notification.error({
        message: `请求错误 ${response.status}`,
        description: errorText,
      });

      if (response.status === 401 || response.status === 403) {
        Modal.error({
          title: "登录已过期",
          content: "很抱歉，您的登录状态已失效，请重新登录。",
          okText: "重新登录",
          onOk: () => {
            localStorage.removeItem("ROOT_APP_INFO");
            window.location.reload();
          },
        });
      }
    } else {
      notification.error({
        message: "网络异常",
        description: "无法连接服务器，请检查网络或跨域配置。",
      });
    }
    return Promise.reject(error);
  }
);

export default request;
