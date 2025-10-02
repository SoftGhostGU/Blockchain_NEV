// API 接口路径配置
export const apiEndpoints = {
  // 用户管理接口
  login: "auth/login",
  logout: "auth/logout",
  getUserInfo: "user/info",
  updateUserInfo: "user/update",
  
  // 用户管理接口
  getUsers: "admin/users",
  getUserDetail: "admin/users",

  // 车辆管理接口
  getVehicles: "admin/vehicles",
  getVehicleDetail: "admin/vehicles",
  approveVehicle: "admin/vehicles/approve",
  rejectVehicle: "admin/vehicles/reject",
  
  // 订单管理接口
  getOrders: "admin/orders",
  getOrderDetail: "admin/orders",
  updateOrderStatus: "admin/orders/status",
  
  // 司机管理接口
  getDrivers: "admin/drivers",
  getDriverDetail: "admin/drivers",
  approveDriver: "admin/drivers/approve",
  rejectDriver: "admin/drivers/reject",
  
  // 财务管理接口
  getFinancials: "admin/financials",
  getFinancialDetail: "admin/financials",
  withdrawFinance: "admin/financials/withdraw",
  
  // 评论管理接口
  getPendingReviews: "admin/reviews/pending",
  getReviewDetail: "admin/reviews",
  approveReview: "admin/reviews/approve",
  rejectReview: "admin/reviews/reject",
  
  // 系统管理接口
  getSystemStats: "admin/stats",
  getSystemLogs: "admin/logs",
  
  // 通用接口
  uploadFile: "common/upload",
  downloadFile: "common/download"
};

export default apiEndpoints;