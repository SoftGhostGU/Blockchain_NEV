interface EnvConfig {
  key: number;
  proxy: boolean;
  ISROUTER: boolean;
  API_BASE_URL?: string;
  API_BASE_PORT?: string;
  API_BASE_TIMEOUT?: number;
}

interface Window {
  envConfig: EnvConfig;
}

// 项目信息配置相关
window.envConfig = {
  key: 0,  // 环境地址 0:开发 1:测试  2:生产
  proxy: true,  // 是否开启代理，允许跨域（只在开发环境有效 true/false)
  ISROUTER: true, // 是否请求后端动态菜单 如不请求请在前端routes/index.jsx配置
  API_BASE_URL: "",    // 地址域名IP等(此处为空禁写，请在switch语句配置地址)
  API_BASE_PORT: "api",    // 二级地址（可为空），用于拼接API_BASE_URL后面
  API_BASE_TIMEOUT: 10,  // 请求超时时间（单位/s）
}

const { envConfig: { key, proxy } } = window

// API_BASE_URL配置
switch (key) {
  case 0:
    // 无需代理(禁止跨域)地址，如开启允许跨域，必须和vite.config.js配置文件下proxy的目标代理地址一致
    let noProxyUrl = "http://127.0.0.1:8080/"

    window.envConfig.API_BASE_URL = proxy ? '/api/' : noProxyUrl
    break;
  case 1:
    window.envConfig.API_BASE_URL = "http://127.0.0.1:8080/"
    window.envConfig.API_BASE_PORT = ""
    break;
  case 2:
    window.envConfig.API_BASE_URL = "http://127.0.0.1:8080/"
    window.envConfig.API_BASE_PORT = ""
    break;
  default:
    break;
}
