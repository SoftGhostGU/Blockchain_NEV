// src/utils/request.ts
import axios from "axios";
import { notification, Modal } from "antd";

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

// 请求拦截器
request.interceptors.request.use(
  (config) => {
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
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const { data } = response;
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
