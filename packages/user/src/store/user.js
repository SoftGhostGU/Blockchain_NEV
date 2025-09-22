import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { getStorageSync, setStorageSync, removeStorageSync, navigateTo } from '@tarojs/taro'

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

export const useUserStore = create()(
  persist(
    (set) => ({
      isLogin: false,
      userInfo: null,
      setUserInfo: (info) => set({ userInfo: info, isLogin: true }),
      clearUserInfo: () => set({ userInfo: null, isLogin: false }),
      logout: () => {
        set({ userInfo: null, isLogin: false })
        removeStorageSync('accessToken')
        removeStorageSync('refreshToken')
        navigateTo({ url: '/pages/login/index' })
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => storage),
    }
  )
)
