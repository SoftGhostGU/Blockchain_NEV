import request from '../utils/request/request';
import { apiEndpoints } from './service';

// 通用请求方法
const createApiMethod = (endpoint: string) => {
  return {
    get: (params?: any) => request.get(endpoint, { params }),
    post: (data?: any) => request.post(endpoint, data),
    put: (data?: any) => request.put(endpoint, data),
    delete: (params?: any) => request.delete(endpoint, { params }),
  };
};

// API 接口对象
export const api = {
  // 用户管理
  auth: {
    login: (data: { username: string; password: string }) => 
      request.post(apiEndpoints.login, data),
    logout: () => 
      request.post(apiEndpoints.logout),
    getUserInfo: () => 
      request.get(apiEndpoints.getUserInfo),
    updateUserInfo: (data: any) => 
      request.put(apiEndpoints.updateUserInfo, data),
  },

  // 用户查看管理
  users: {
    getList: (params?: { page?: number; size?: number; username?: string }) => 
      request.get(apiEndpoints.getUsers, { params }),
    getDetail: (id: string | number) => 
      request.get(`${apiEndpoints.getUserDetail}/${id}`),
  },

  // 车辆管理
  vehicles: {
    getList: (params?: { page?: number; size?: number; licensePlate?: string; auditStatus?: string }) => 
      request.get(apiEndpoints.getVehicles, { params }),
    getDetail: (id: string | number) => 
      request.get(`${apiEndpoints.getVehicleDetail}/${id}`),
    // 车辆审核统一接口 (status: 1=待审核, 2=已通过, 3=已拒绝)
    audit: (id: string | number, status: number, data?: any) => {
      const params = { status, ...data };
      return request.put(`admin/vehicles/${id}/audit`, null, { params });
    },
    // 保留旧方法以兼容（内部调用audit方法）
    approve: (id: string | number, data?: any) => 
      api.vehicles.audit(id, 2, data),
    reject: (id: string | number, data?: any) => 
      api.vehicles.audit(id, 3, data),
  },

  // 订单管理
  orders: {
    getList: (params?: { page?: number; size?: number; status?: string; driverId?: string }) => 
      request.get(apiEndpoints.getOrders, { params }),
    getDetail: (id: string | number) => 
      request.get(`${apiEndpoints.getOrderDetail}/${id}`),
    updateStatus: (id: string | number, data: { status: string; remark?: string }) => 
      request.put(`${apiEndpoints.updateOrderStatus}/${id}`, data),
  },

  // 司机管理
  drivers: {
    getList: (params?: { page?: number; size?: number; status?: string; name?: string }) => 
      request.get(apiEndpoints.getDrivers, { params }),
    getDetail: (id: string | number) => 
      request.get(`${apiEndpoints.getDriverDetail}/${id}`),
    approve: (id: string | number, data?: any) => 
      request.post(`${apiEndpoints.approveDriver}/${id}`, data),
    reject: (id: string | number, data?: any) => 
      request.post(`${apiEndpoints.rejectDriver}/${id}`, data),
  },

  // 财务管理
  financials: {
    getList: (params?: { page?: number; size?: number; type?: string; status?: string }) => 
      request.get(apiEndpoints.getFinancials, { params }),
    getDetail: (id: string | number) => 
      request.get(`${apiEndpoints.getFinancialDetail}/${id}`),
    withdraw: (data: { amount: number; account: string; remark?: string }) => 
      request.post(apiEndpoints.withdrawFinance, data),
  },

  // 评论管理
  reviews: {
    getPending: (params?: { page?: number; size?: number; orderId?: string; userId?: string; driverId?: string }) => 
      request.get(apiEndpoints.getPendingReviews, { params }),
    getDetail: (id: string | number) => 
      request.get(`${apiEndpoints.getReviewDetail}/${id}`),
    // 评论审核统一接口 (status: 2=通过, 3=拒绝)
    audit: (id: string | number, status: number, data?: any) => {
      const params = { status, ...data };
      return request.put(`admin/reviews/${id}/audit`, null, { params });
    },
    // 保留旧方法以兼容（内部调用audit方法）
    approve: (id: string | number, data?: any) => 
      api.reviews.audit(id, 2, data),
    reject: (id: string | number, data?: any) => 
      api.reviews.audit(id, 3, data),
  },

  // 系统管理
  system: {
    getStats: () => 
      request.get(apiEndpoints.getSystemStats),
    getLogs: (params?: { page?: number; size?: number; level?: string; module?: string }) => 
      request.get(apiEndpoints.getSystemLogs, { params }),
  },

  // 通用接口
  common: {
    uploadFile: (file: FormData) => 
      request.post(apiEndpoints.uploadFile, file, {
        headers: { 'Content-Type': 'multipart/form-data' }
      }),
    downloadFile: (params: { fileId: string; fileName?: string }) => 
      request.get(apiEndpoints.downloadFile, { params, responseType: 'blob' }),
  }
};

// 兼容旧版本的导出方式
export const {
  auth,
  users,
  vehicles,
  orders,
  drivers,
  financials,
  system,
  common
} = api;

// 默认导出
export default api;