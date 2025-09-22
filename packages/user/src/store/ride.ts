import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { getStorageSync, setStorageSync, removeStorageSync } from '@tarojs/taro'
import { Location } from '../api/type'

// 重用 API 中的 Location 类型定义，确保类型一致性

export interface PriceInfo {
  estimatedPrice: number
  estimatedDistance?: number
  estimatedDuration?: number
  blockchainFee?: number
  priceBreakdown?: Array<{ label: string; amount: number }>
}

export interface DriverInfo {
  name: string
  phone: string
  rating?: number
  creditScore?: number
}

export interface VehicleInfo {
  type: string
  plateNumber: string
  imageUrl?: string
}

export interface Order {
  orderId: string
  orderNumber: string
  status: string // 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'failed'
  createdAt: string
  startLocation: Location | null
  endLocation: Location | null
  carTypeId: string | null
  preference: string
  departureTime: string
  price: PriceInfo | null
  driver: DriverInfo | null
  vehicle: VehicleInfo | null
  rating?: number // 用户评分
  completedAt?: string
  cancelledAt?: string
  cancelReason?: string
  error?: string
}

export interface RideState {
  // --- 基础行程数据 ---
  currentLocation: Location | null
  destinationLocation: Location | null
  startAddressInput: string
  endAddressInput: string

  // --- 用户选择 ---
  selectedCarType: string
  travelPreference: string
  selectedTimeOption: string

  // --- 订单管理 ---
  orders: Order[]
  activeOrderId: string | null

  // --- setter ---
  setCurrentLocation: (loc: Location) => void
  setDestinationLocation: (loc: Location) => void
  setStartAddressInput: (text: string) => void
  setEndAddressInput: (text: string) => void

  setSelectedCarType: (type: string) => void
  setTravelPreference: (p: string) => void
  setSelectedTimeOption: (t: string) => void

  // --- 订单操作 ---
  addOrder: (order: Partial<Order> & { orderId?: string }) => string
  addLocalOrder: (partial?: Partial<Order>) => string
  replaceOrder: (oldId: string, serverOrder: Partial<Order> & { orderId?: string }) => void
  setActiveOrder: (id: string | null) => void
  updateOrder: (id: string, partial: Partial<Order>) => void
  removeOrder: (id: string) => void
  clearOrders: () => void

  // --- 查询 / 辅助 ---
  getOrderById: (id: string) => Order | null
  getActiveOrder: () => Order | null
  listOrders: () => Order[]
  findOrdersByStatus: (status: string) => Order[]

  markOrderCompleted: (id: string) => void
  cancelOrder: (id: string, reason: string) => void
}

/**
 * Taro storage adapter - 与 createJSONStorage 配合
 */
const storage = {
  getItem: (name: string) => {
    try {
      const value = getStorageSync(name)
      return value ?? null
    } catch {
      return null
    }
  },
  setItem: (name: string, value: string) => {
    try {
      setStorageSync(name, value)
    } catch {}
  },
  removeItem: (name: string) => {
    try {
      removeStorageSync(name)
    } catch {}
  }
}

export const useRideStore = create<RideState>()(
  persist(
    (set, get) => ({
      // --- 基础行程数据 ---
      currentLocation: {
        latitude: 22.5431,
        longitude: 114.0579,
        address: '深圳市南山区深圳湾科技生态园',
        landmark: '腾讯滨海大厦'
      },
      destinationLocation: null,
      startAddressInput: '',
      endAddressInput: '',

      // --- 用户选择 ---
      selectedCarType: 'economy',
      travelPreference: '',
      selectedTimeOption: 'now',

      // --- 订单管理 ---
      orders: [],
      activeOrderId: null,

      // --- setter ---
      setCurrentLocation: (loc) => set({ currentLocation: loc }),
      setDestinationLocation: (loc) => set({ destinationLocation: loc }),
      setStartAddressInput: (text) => set({ startAddressInput: text }),
      setEndAddressInput: (text) => set({ endAddressInput: text }),

      setSelectedCarType: (type) => set({ selectedCarType: type }),
      setTravelPreference: (p) => set({ travelPreference: p }),
      setSelectedTimeOption: (t) => set({ selectedTimeOption: t }),

      // --- 订单操作 ---
      addOrder: (order) => {
        const id = order.orderId ?? `server-${Date.now()}`
        const normalized: Order = {
          orderId: id,
          orderNumber: order.orderNumber ?? `ORD${Date.now()}`,
          status: order.status ?? 'pending',
          createdAt: order.createdAt ?? new Date().toISOString(),
          startLocation: order.startLocation ?? null,
          endLocation: order.endLocation ?? null,
          carTypeId: order.carTypeId ?? null,
          preference: order.preference ?? '',
          departureTime: order.departureTime ?? 'now',
          price: order.price ?? null,
          driver: order.driver ?? null,
          vehicle: order.vehicle ?? null,
          completedAt: order.completedAt,
          cancelledAt: order.cancelledAt,
          cancelReason: order.cancelReason,
          error: order.error,
        }
        set((state) => {
          const exists = state.orders.some((o) => o.orderId === id)
          const newOrders = exists
            ? state.orders.map((o) => (o.orderId === id ? normalized : o))
            : [...state.orders, normalized]
          return { orders: newOrders, activeOrderId: id }
        })
        return id
      },

      addLocalOrder: (partial = {}) => {
        const id = `local-${Date.now()}`
        const localOrder: Order = {
          orderId: id,
          orderNumber: `LOCAL${Date.now()}`,
          status: 'pending',
          createdAt: new Date().toISOString(),
          startLocation: null,
          endLocation: null,
          carTypeId: null,
          preference: '',
          departureTime: 'now',
          price: null,
          driver: null,
          vehicle: null,
          ...partial
        }
        set((state) => ({
          orders: [...state.orders, localOrder],
          activeOrderId: id
        }))
        return id
      },

      replaceOrder: (oldId, serverOrder) => {
        const newId = serverOrder.orderId ?? `server-${Date.now()}`
        const normalized: Order = {
          orderId: newId,
          orderNumber: serverOrder.orderNumber ?? `ORD${Date.now()}`,
          status: serverOrder.status ?? 'pending',
          createdAt: serverOrder.createdAt ?? new Date().toISOString(),
          startLocation: serverOrder.startLocation ?? null,
          endLocation: serverOrder.endLocation ?? null,
          carTypeId: serverOrder.carTypeId ?? null,
          preference: serverOrder.preference ?? '',
          departureTime: serverOrder.departureTime ?? 'now',
          price: serverOrder.price ?? null,
          driver: serverOrder.driver ?? null,
          vehicle: serverOrder.vehicle ?? null,
          completedAt: serverOrder.completedAt,
          cancelledAt: serverOrder.cancelledAt,
          cancelReason: serverOrder.cancelReason,
          error: serverOrder.error,
        }

        set((state) => {
          const replaced = state.orders.map((o) => (o.orderId === oldId ? normalized : o))
          const unique: Order[] = []
          for (const o of replaced) {
            if (!unique.find((x) => x.orderId === o.orderId)) {
              unique.push(o)
            } else if (o.orderId === normalized.orderId) {
              const idx = unique.findIndex((x) => x.orderId === o.orderId)
              if (idx >= 0) unique[idx] = normalized
            }
          }
          return {
            orders: unique,
            activeOrderId: state.activeOrderId === oldId ? normalized.orderId : state.activeOrderId
          }
        })
      },

      setActiveOrder: (id) => set({ activeOrderId: id }),

      updateOrder: (id, partial) => {
        set((state) => ({
          orders: state.orders.map((o) => (o.orderId === id ? { ...o, ...partial } : o))
        }))
      },

      removeOrder: (id) => {
        set((state) => ({
          orders: state.orders.filter((o) => o.orderId !== id),
          activeOrderId: state.activeOrderId === id ? null : state.activeOrderId
        }))
      },

      clearOrders: () => set({ orders: [], activeOrderId: null }),

      // --- 查询 / 辅助 ---
      getOrderById: (id) => get().orders.find((o) => o.orderId === id) || null,
      getActiveOrder: () => {
        const st = get()
        return st.orders.find((o) => o.orderId === st.activeOrderId) || null
      },
      listOrders: () => get().orders.slice(),
      findOrdersByStatus: (status) => get().orders.filter((o) => o.status === status),

      markOrderCompleted: (id) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.orderId === id ? { ...o, status: 'completed', completedAt: new Date().toISOString() } : o
          )
        }))
      },

      cancelOrder: (id, reason) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.orderId === id ? { ...o, status: 'cancelled', cancelReason: reason, cancelledAt: new Date().toISOString() } : o
          ),
          activeOrderId: state.activeOrderId === id ? null : state.activeOrderId
        }))
      }
    }),
    {
      name: 'ride-storage',
      storage: createJSONStorage(() => storage),
    }
  )
)
