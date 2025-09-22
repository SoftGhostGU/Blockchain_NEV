
export interface Location {
  latitude: number;
  longitude: number;
  address: string;
  landmark?: string;
}

export interface CarType {
  id: string;
  name: string;
  estimatedTime: number; // 分钟
  basePrice: number;
  pricePerKm: number;
  description?: string;
}

// 价格预估接口
export interface PriceEstimateRequest {
  startLocation: Location;
  endLocation: Location;
  carTypeId: string;
  estimatedDistance?: number; // km
  estimatedDuration?: number; // 分钟
}

export interface PriceEstimateResponse {
  success: boolean;
  data?: {
    carTypeId: string;
    estimatedPrice: number;
    basePrice: number;
    distancePrice: number;
    surcharge?: number; // 附加费
    discount?: number; // 折扣
    estimatedDistance: number;
    estimatedDuration: number;
    priceBreakdown: {
      label: string;
      amount: number;
    }[];
    validUntil: string; // 价格有效期
    blockchainFee: number; // 区块链手续费
  };
  message?: string;
  error?: string;
}

// 订单创建接口
export interface CreateOrderRequest {
  startLocation: Location;
  endLocation: Location;
  carTypeId: string;
  estimatedPrice: number;
  paymentMethod: 'blockchain' | 'wallet' | 'credit';
  passengerCount?: number;
  specialRequests?: string;
  scheduledTime?: string; // ISO时间格式，立即用车时为空
}

export interface CreateOrderResponse {
  success: boolean;
  data?: {
    orderId: string;
    orderNumber: string;
    status: 'pending' | 'confirmed' | 'driver_assigned' | 'in_progress' | 'completed' | 'cancelled';
    estimatedPrice: number;
    actualPrice?: number;
    createdAt: string;
    estimatedArrivalTime?: string;
    driver?: {
      id: string;
      name: string;
      phone: string;
      avatar?: string;
      rating: number;
      vehicleInfo: {
        plateNumber: string;
        model: string;
        color: string;
      };
      location?: Location;
    };
    paymentInfo: {
      method: string;
      status: 'pending' | 'processing' | 'completed' | 'failed';
      transactionHash?: string; // 区块链交易哈希
      blockchainNetwork?: string;
    };
    trackingInfo?: {
      driverLocation: Location;
      estimatedArrival: number; // 分钟
      route?: Location[];
    };
  };
  message?: string;
  error?: string;
}

// 通用API响应格式
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
  requestId: string;
}