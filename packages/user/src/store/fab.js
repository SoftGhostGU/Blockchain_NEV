import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { getStorageSync, setStorageSync, removeStorageSync } from '@tarojs/taro'

const storage = {
  getItem: async (name) => {
    try {
      const value = getStorageSync(name)
      return value || null
    } catch {
      return null
    }
  },
  setItem: async (name, value) => {
    try {
      setStorageSync(name, value)
    } catch {}
  },
  removeItem: async (name) => {
    try {
      removeStorageSync(name)
    } catch {}
  },
}

export const useFabStore = create()(
  persist(
    (set, get) => ({
      // 悬浮球位置状态
      position: { x: 300, y: 500 }, // 默认位置
      dragging: false,
      
      // 更新位置
      setPosition: (newPosition) => set({ position: newPosition }),
      
      // 设置拖拽状态
      setDragging: (isDragging) => set({ dragging: isDragging }),
      
      // 重置位置到默认值
      resetPosition: () => set({ position: { x: 300, y: 500 } }),
      
      // 获取当前位置
      getPosition: () => get().position,
    }),
    {
      name: 'fab-storage', // 存储键名
      storage: createJSONStorage(() => storage),
      // 只持久化位置信息，不持久化拖拽状态
      partialize: (state) => ({ position: state.position }),
    }
  )
)