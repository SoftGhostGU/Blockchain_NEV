import { Order } from '../../store/ride'

/**
 * 模拟订单数据 - 用于本地测试
 */
export const createMockOrderData = (): Partial<Order> => {
  return {
    startLocation: {
      latitude: 22.5431,
      longitude: 114.0579,
      address: '深圳市南山区深圳湾科技生态园',
      landmark: '腾讯滨海大厦'
    },
    endLocation: {
      latitude: 22.5649,
      longitude: 114.0681,
      address: '深圳市福田区平安金融中心',
      landmark: '平安国际金融中心'
    },
    carTypeId: 'economy',
    preference: 'quiet',
    departureTime: 'now',
    price: {
      estimatedPrice: 35,
      estimatedDuration: 30,
      estimatedDistance: 12
    },
    driver: {
      name: '张师傅',
      phone: '13800001111',
      creditScore: 98
    },
    vehicle: {
      type: '丰田凯美瑞',
      plateNumber: '粤B12345',
      imageUrl: 'https://example.com/car.jpg'
    },
    status: 'pending'
  }
}

/**
 * 根据车型获取对应的mock数据（仅包含价格、司机、车辆信息）
 * @param carTypeId 车型ID
 * @returns 包含价格、司机、车辆信息的mock数据
 */
export const getMockDataByCarType = (carTypeId: string) => {
  const mockDataMap = {
    economy: {
      price: { estimatedPrice: 35, estimatedDuration: 30, estimatedDistance: 12 },
      driver: { name: '张师傅', phone: '13800001111', creditScore: 98 },
      vehicle: { type: '丰田凯美瑞', plateNumber: '粤B12345', imageUrl: 'https://example.com/car.jpg' }
    },
    comfort: {
      price: { estimatedPrice: 45, estimatedDuration: 28, estimatedDistance: 12 },
      driver: { name: '李师傅', phone: '13800002222', creditScore: 95 },
      vehicle: { type: '本田雅阁', plateNumber: '粤B67890', imageUrl: 'https://example.com/car2.jpg' }
    },
    luxury: {
      price: { estimatedPrice: 65, estimatedDuration: 25, estimatedDistance: 12 },
      driver: { name: '王师傅', phone: '13800003333', creditScore: 99 },
      vehicle: { type: '奔驰E级', plateNumber: '粤B11111', imageUrl: 'https://example.com/car3.jpg' }
    }
  }
  
  return mockDataMap[carTypeId] || mockDataMap.economy
}

/**
 * 创建多个不同的模拟订单数据
 */
export const getMockOrderVariants = () => {
  const baseOrder = createMockOrderData()
  
  return [
    // 经济型订单
    {
      ...baseOrder,
      carTypeId: 'economy',
      price: { estimatedPrice: 35, estimatedDuration: 30, estimatedDistance: 12 },
      driver: { name: '张师傅', phone: '13800001111', creditScore: 98 },
      vehicle: { type: '丰田凯美瑞', plateNumber: '粤B12345', imageUrl: 'https://example.com/car.jpg' }
    },
    // 舒适型订单
    {
      ...baseOrder,
      carTypeId: 'comfort',
      price: { estimatedPrice: 45, estimatedDuration: 28, estimatedDistance: 12 },
      driver: { name: '李师傅', phone: '13800002222', creditScore: 95 },
      vehicle: { type: '本田雅阁', plateNumber: '粤B67890', imageUrl: 'https://example.com/car2.jpg' }
    },
    // 豪华型订单
    {
      ...baseOrder,
      carTypeId: 'luxury',
      price: { estimatedPrice: 65, estimatedDuration: 25, estimatedDistance: 12 },
      driver: { name: '王师傅', phone: '13800003333', creditScore: 99 },
      vehicle: { type: '奔驰E级', plateNumber: '粤B11111', imageUrl: 'https://example.com/car3.jpg' }
    }
  ]
}