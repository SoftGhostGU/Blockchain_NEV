export const service = {
  // 用户端
  register: "driver/register",               // 车主注册
  login: "driver/login",                     // 车主登录
  addVehicle: "driver/vehicle",              // 添加用户车辆
  acceptOrder: "driver/order/accept",        // 车主接单
  completeOrder: "driver/order/complete",    // 车主完成订单
  orderHistory: "driver/orders/history",     // 获取车主历史订单
  recent7dayTurn: "driver/turnover/days",    // 获取最近7天的营业额
  recent7MonTurn: "driver/turnover/months",  // 获取最近7个月的营业额
  uploadBankcard: "driver/bankcard",         // 上传银行卡
  getVehicleInfo: "driver/vehicle/{vehicleId}/condition",  // 获取车辆信息

  // 财务接口
  withdrawFinance: "financial/withdraw",      // 提现
  getFinanceInfo: "financial/records",        // 获取财务信息
};

// 自动拼接二级地址
for (let key in service) {
  if (service.hasOwnProperty(key)) {
    const serviceKey = key as keyof typeof service;
    service[serviceKey] = `${window.envConfig.API_BASE_URL}${window.envConfig.API_BASE_PORT ? window.envConfig.API_BASE_PORT + '/' : ""}${service[serviceKey]}`;
  }
}

export function getVehicleInfoUrl(vehicleId: string) {
  return `${service.getVehicleInfo.replace("{vehicleId}", vehicleId)}`;
}
