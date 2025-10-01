import request from "../utils/request/request";
import { notification } from 'antd'
let API_BASE_URL = window.envConfig['API_BASE_URL']
let API_BASE_PORT = window.envConfig['API_BASE_PORT']

export function axios(method: string, url: string, params?: any) {
  switch (method) {
    case "get":
      return request({ url, method: "get", params });
    case "post":
      return request({ url, method: "post", data: params });
    case "put":
      return request({ url, method: "put", data: params });
    case "delete":
      return request({ url, method: "delete", params });
    case "upLoad":
      return request({
        url,
        method: "post",
        data: params,
        headers: { "Content-Type": "multipart/form-data" },
      });
    default:
      return notification.error({
        message: "请求方式错误",
        description: "找不到此方法，请检查拼写",
      });
  }
}
