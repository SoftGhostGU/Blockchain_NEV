export const service = {
  // 用户端
  register: "driver/register",               // 车主注册
  login: "driver/login",                     // 车主登录
  addVehicle: "driver/vehicle",              // 添加用户车辆
  acceptOrder: "driver/order/accept",        // 车主接单
  completeOrder: "driver/order/complete",    // 车主完成订单
  orderHistory: "driver/orders/history",     // 获取车主历史订单
  recent7dayTurn: "driver/turnover/7days",    // 获取最近7天的营业额
  recent7MonTurn: "driver/turnover/months",  // 获取最近7个月的营业额
  uploadBankcard: "driver/bankcard",         // 上传银行卡
  getVehicleInfo: "driver/vehicle/{vehicleId}/condition",  // 获取车辆信息
  getProfile: "driver/profile",              // 获取用户信息
  updateProfile: "driver/profile",           // 更新用户信息

  // 财务接口
  withdrawFinance: "financial/withdraw",      // 提现
  getFinanceInfo: "financial/records",        // 获取财务信息
  getWithdrawableBalance: "financial/withdrawable-balance", // 获取可提现余额
  
  // 订单接口
  getMonthlyOrderTypeDistribution: "order/monthly-type-distribution", // 获取本月订单类型分布
  getStarDistribution: "order/star-distribution", // 获取评价分布
  
  // 车辆管理接口
  dispatchVehicle: "driver/vehicle/{vehicleId}/dispatch", // 派出车辆
  recallVehicle: "driver/vehicle/{vehicleId}/recall", // 召回车辆
};

export function getVehicleInfoUrl(vehicleId: string) {
  return `${service.getVehicleInfo.replace("{vehicleId}", vehicleId)}`;
}

export function getDispatchVehicleUrl(vehicleId: string) {
  return `${service.dispatchVehicle.replace("{vehicleId}", vehicleId)}`;
}

export function getRecallVehicleUrl(vehicleId: string) {
  return `${service.recallVehicle.replace("{vehicleId}", vehicleId)}`;
}
