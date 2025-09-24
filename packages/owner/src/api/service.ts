export const service = {
  login: "auth/login",          // 登录
  logout: "auth/logout",        // 登出
  getUserInfo: "user/info",     // 获取用户信息
};

// 自动拼接二级地址
for (let key in service) {
  if (service.hasOwnProperty(key)) {
    const serviceKey = key as keyof typeof service;
    service[serviceKey] = `${window.envConfig.API_BASE_PORT || ""}/${service[serviceKey]}`;
  }
}
