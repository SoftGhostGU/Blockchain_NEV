
import Taro from '@tarojs/taro';
import {
  PriceEstimateRequest,
  PriceEstimateResponse,
  CreateOrderRequest,
  CreateOrderResponse,
  Location,
  CarType
} from './type'; // 修复：改为 types 而不是 type

// 模拟数据配置
const MOCK_DATA_ENABLED = true; // 开发环境使用模拟数据
const API_BASE_URL = 'https://your-api-domain.com/api/v1';

class RideService {
  // 价格预估接口
  async estimatePrice(request: PriceEstimateRequest): Promise<PriceEstimateResponse> {
    if (MOCK_DATA_ENABLED) {
      return this.mockPriceEstimate(request);
    }

    try {
      const response = await Taro.request({
        url: `${API_BASE_URL}/ride/estimate-price`,
        method: 'POST',
        data: request,
        header: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      return response.data as PriceEstimateResponse;
    } catch (error) {
      console.error('价格预估接口调用失败:', error);
      return {
        success: false,
        error: '网络请求失败，请检查网络连接'
      };
    }
  }

  // 创建订单接口
  async createOrder(request: CreateOrderRequest): Promise<CreateOrderResponse> {
    if (MOCK_DATA_ENABLED) {
      return this.mockCreateOrder(request);
    }

    try {
      const response = await Taro.request({
        url: `${API_BASE_URL}/ride/create-order`,
        method: 'POST',
        data: request,
        header: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      return response.data as CreateOrderResponse;
    } catch (error) {
      console.error('创建订单接口调用失败:', error);
      return {
        success: false,
        error: '创建订单失败，请重试'
      };
    }
  }

  // 获取车型列表
  async getCarTypes(): Promise<CarType[]> {
    if (MOCK_DATA_ENABLED) {
      return Promise.resolve(this.mockCarTypes());
    }

    try {
      const response = await Taro.request({
        url: `${API_BASE_URL}/ride/car-types`,
        method: 'GET',
        header: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      return response.data.data || [];
    } catch (error) {
      console.error('获取车型列表失败:', error);
      return this.mockCarTypes();
    }
  }

  // 获取用户认证token
  private getAuthToken(): string {
    // 从本地存储获取token
    try {
      return Taro.getStorageSync('auth_token') || '';
    } catch (error) {
      console.warn('获取认证token失败:', error);
      return '';
    }
  }

  // 模拟价格预估数据
  private mockPriceEstimate(request: PriceEstimateRequest): Promise<PriceEstimateResponse> {
    return new Promise((resolve) => {
      // 模拟网络延迟
      setTimeout(() => {
        try {
          const basePrice = this.getCarBasePrice(request.carTypeId);
          const distance = request.estimatedDistance || Math.random() * 15 + 5; // 5-20km
          const distancePrice = distance * this.getCarPricePerKm(request.carTypeId);
          const blockchainFee = Math.round(basePrice * 0.02); // 2%手续费
          const surcharge = Math.random() > 0.7 ? Math.round(Math.random() * 10 + 5) : 0; // 30%概率有附加费
          
          const totalPrice = Math.round(basePrice + distancePrice + blockchainFee + surcharge);

          resolve({
            success: true,
            data: {
              carTypeId: request.carTypeId,
              estimatedPrice: totalPrice,
              basePrice,
              distancePrice: Math.round(distancePrice),
              surcharge,
              estimatedDistance: Math.round(distance * 10) / 10,
              estimatedDuration: Math.round(distance * 2.5), // 假设平均时速24km/h
              priceBreakdown: [
                { label: '起步费', amount: basePrice },
                { label: '里程费', amount: Math.round(distancePrice) },
                { label: '区块链手续费', amount: blockchainFee },
                ...(surcharge > 0 ? [{ label: '高峰时段费', amount: surcharge }] : [])
              ],
              validUntil: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10分钟有效期
              blockchainFee
            }
          });
        } catch (error) {
          console.error('模拟价格估算失败:', error);
          resolve({
            success: false,
            error: '价格估算失败，请重试'
          });
        }
      }, 800 + Math.random() * 1200); // 0.8-2秒延迟
    });
  }

  // 模拟创建订单数据
  private mockCreateOrder(request: CreateOrderRequest): Promise<CreateOrderResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
          const orderNumber = `BC${Date.now().toString().slice(-8)}`;
          
          // 90%成功率
          if (Math.random() < 0.9) {
            const driverNames = ['张师傅', '李师傅', '王师傅', '陈师傅'];
            const carModels = ['比亚迪秦', '特斯拉Model 3', '奔驰E级', '宝马5系'];
            const carColors = ['白色', '黑色', '银色', '蓝色'];
            
            resolve({
              success: true,
              data: {
                orderId,
                orderNumber,
                status: 'confirmed',
                estimatedPrice: request.estimatedPrice,
                createdAt: new Date().toISOString(),
                estimatedArrivalTime: new Date(Date.now() + Math.random() * 8 * 60 * 1000).toISOString(),
                driver: {
                  id: `driver_${Math.random().toString(36).substr(2, 8)}`,
                  name: driverNames[Math.floor(Math.random() * driverNames.length)],
                  phone: `138****${Math.floor(Math.random() * 9000 + 1000)}`,
                  avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=driver${Math.random()}`,
                  rating: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10, // 3.5-5.0
                  vehicleInfo: {
                    plateNumber: `粤B·${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
                    model: carModels[Math.floor(Math.random() * carModels.length)],
                    color: carColors[Math.floor(Math.random() * carColors.length)]
                  },
                  location: {
                    latitude: request.startLocation.latitude + (Math.random() - 0.5) * 0.01,
                    longitude: request.startLocation.longitude + (Math.random() - 0.5) * 0.01,
                    address: '正在前往上车点'
                  }
                },
                paymentInfo: {
                  method: request.paymentMethod,
                  status: 'processing',
                  transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
                  blockchainNetwork: 'Ethereum'
                },
                trackingInfo: {
                  driverLocation: {
                    latitude: request.startLocation.latitude + (Math.random() - 0.5) * 0.01,
                    longitude: request.startLocation.longitude + (Math.random() - 0.5) * 0.01,
                    address: '距离您约0.8公里'
                  },
                  estimatedArrival: Math.floor(Math.random() * 8) + 3 // 3-10分钟
                }
              }
            });
          } else {
            resolve({
              success: false,
              error: '当前区域司机繁忙，请稍后重试'
            });
          }
        } catch (error) {
          console.error('模拟创建订单失败:', error);
          resolve({
            success: false,
            error: '创建订单失败，请重试'
          });
        }
      }, 1500 + Math.random() * 2000); // 1.5-3.5秒延迟
    });
  }

  // 模拟车型数据
  private mockCarTypes(): CarType[] {
    return [
      {
        id: 'economy',
        name: '经济型',
        estimatedTime: 3,
        basePrice: 12,
        pricePerKm: 1.6,
        description: '经济实惠，性价比高'
      },
      {
        id: 'comfort',
        name: '舒适型',
        estimatedTime: 5,
        basePrice: 18,
        pricePerKm: 2.2,
        description: '舒适体验，空间宽敞'
      },
      {
        id: 'luxury',
        name: '豪华型',
        estimatedTime: 8,
        basePrice: 28,
        pricePerKm: 3.5,
        description: '豪华享受，尊贵服务'
      }
    ];
  }

  // 获取车型基础价格
  private getCarBasePrice(carTypeId: string): number {
    const prices: {[key: string]: number} = { 
      economy: 12, 
      comfort: 18, 
      luxury: 28 
    };
    return prices[carTypeId] || 12;
  }

  // 获取车型每公里价格
  private getCarPricePerKm(carTypeId: string): number {
    const prices: {[key: string]: number} = { 
      economy: 1.6, 
      comfort: 2.2, 
      luxury: 3.5 
    };
    return prices[carTypeId] || 1.6;
  }
}

// 导出单例实例
const rideService = new RideService();
export default rideService;