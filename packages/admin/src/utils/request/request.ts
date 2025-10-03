import axios from "axios";
import { encrypt, decrypt } from "../IBE";

// 获取配置，提供默认值
const getConfig = () => {
  const config = (window as any).envConfig || {};
  return {
    API_BASE_URL: config.API_BASE_URL || '/api/',
    API_BASE_PORT: config.API_BASE_PORT || '',
    API_BASE_TIMEOUT: config.API_BASE_TIMEOUT || 10
  };
};

const config = getConfig();

// 获取用户身份
const getUserIdentity = (): string => {
  try {
    const appInfo = localStorage.getItem("ROOT_APP_INFO");
    if (appInfo) {
      const { user } = JSON.parse(appInfo);
      if (user && user.role) {
        return `${user.role.toUpperCase()}_${user.id || 'ADMIN'}`;
      }
    }
  } catch (error) {
    console.warn("获取用户身份失败:", error);
  }
  return "ADMIN"; // 默认管理员身份
};

// axios 实例
const request = axios.create({
  baseURL: `${config.API_BASE_URL}${config.API_BASE_PORT}`,
  timeout: config.API_BASE_TIMEOUT * 1000, // 秒转毫秒
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

// 请求拦截器
request.interceptors.request.use(
  (config: any) => {
    const appInfo = localStorage.getItem("ROOT_APP_INFO");
    if (appInfo) {
      try {
        const { token } = JSON.parse(appInfo);
        if (token && config.headers) {
          config.headers["Authorization"] = `Bearer ${token}`;
        }
      } catch (e) {
        console.warn("解析 ROOT_APP_INFO 出错:", e);
      }
    }

    // IBE加密：对请求数据中的敏感字段进行加密
    if (config.data && typeof config.data === 'object') {
      const userIdentity = getUserIdentity();
      const accessPolicy = `(${userIdentity})`; // 只有当前用户可以解密
      
      try {
        const encryptedData = encrypt(config.data, accessPolicy);
        config.data = encryptedData;
        console.log('IBE加密请求数据:', encryptedData);
      } catch (error) {
        console.warn('IBE加密失败，使用原始数据:', error);
      }
    }

    // IBE加密：对GET请求参数中的敏感字段进行加密
    if (config.params && typeof config.params === 'object') {
      const userIdentity = getUserIdentity();
      const accessPolicy = `(${userIdentity})`;
      
      try {
        const encryptedParams = encrypt(config.params, accessPolicy);
        config.params = encryptedParams;
        console.log('IBE加密请求参数:', encryptedParams);
      } catch (error) {
        console.warn('IBE加密参数失败，使用原始参数:', error);
      }
    }

    return config;
  },
  (error: any) => Promise.reject(error)
);

// 响应拦截器
request.interceptors.response.use(
  (response: any) => {
    const { data } = response;
    
    // 添加详细的响应日志
    console.log("API响应:", {
      url: response.config?.url,
      status: response.status,
      data: data
    });
    
    // 如果响应数据为空或不是对象，直接返回
    if (!data || typeof data !== 'object') {
      return data;
    }
    
    // IBE解密：对响应数据中的敏感字段进行解密
    const decryptResponseData = (responseData: any): any => {
      if (!responseData || typeof responseData !== 'object') {
        return responseData;
      }
      
      const userIdentity = getUserIdentity();
      
      // 处理分页响应格式
      if (responseData.content && Array.isArray(responseData.content)) {
        const decryptedContent = responseData.content.map((item: any) => {
          try {
            const decrypted = decrypt(item, userIdentity);
            return decrypted || item;
          } catch (error) {
            console.warn('IBE解密数组项失败:', error);
            return item;
          }
        });
        return { ...responseData, content: decryptedContent };
      }
      
      // 处理普通数组响应
      if (Array.isArray(responseData)) {
        return responseData.map((item: any) => {
          try {
            const decrypted = decrypt(item, userIdentity);
            return decrypted || item;
          } catch (error) {
            console.warn('IBE解密数组项失败:', error);
            return item;
          }
        });
      }
      
      // 处理单个对象
      try {
        const decrypted = decrypt(responseData, userIdentity);
        return decrypted || responseData;
      } catch (error) {
        console.warn('IBE解密对象失败:', error);
        return responseData;
      }
    };
    
    const decryptedData = decryptResponseData(data);
    
    // 按后端约定：0 或 200 才算成功，或者没有code字段也认为成功
    if (data.code !== undefined && data.code !== 0 && data.code !== 200) {
      const errorText = data.message || codeMessage[data.code] || "未知错误";
      console.error("请求错误:", {
        code: data.code,
        message: errorText,
        url: response.config?.url
      });
      // 不要在这里抛出错误，让调用方处理
    }
    
    return decryptedData;
  },
  (error: any) => {
    if (error.message && error.message.includes("timeout")) {
      console.error("请求超时: 请检查网络或稍后再试");
      return Promise.reject(error);
    }

    const { response } = error;
    if (response?.status) {
      const errorText = response.data?.message || codeMessage[response.status];
      console.error(`请求错误 ${response.status}:`, errorText);

      if (response.status === 401 || response.status === 403) {
        console.error("登录已过期，需要重新登录");
        localStorage.removeItem("ROOT_APP_INFO");
        window.location.reload();
      }
    } else {
      console.error("网络异常: 无法连接服务器，请检查网络或跨域配置");
    }
    return Promise.reject(error);
  }
);

export default request;