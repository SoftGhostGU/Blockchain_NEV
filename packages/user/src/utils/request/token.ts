import Taro from '@tarojs/taro'

// 统一的token键名（与现有实现兼容）
export const ACCESS_TOKEN_KEY = 'accessToken'
export const REFRESH_TOKEN_KEY = 'refreshToken'
// 统一聚合存储键（H5场景可用）
export const USER_APP_INFO_KEY = 'USER_APP_INFO'

export interface UserAppInfo {
  token?: string
  refreshToken?: string
  userInfo?: any
}

function safeGet<T = any>(key: string): T | null {
  try {
    // 优先使用 Taro 存储（多端兼容）
    const v = Taro.getStorageSync(key)
    if (v) return v as T
  } catch {}
  try {
    // H5 环境兜底
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {}
  return null
}

function safeSet(key: string, value: any) {
  try { Taro.setStorageSync(key, value) } catch {}
  try { localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value)) } catch {}
}

function safeRemove(key: string) {
  try { Taro.removeStorageSync(key) } catch {}
  try { localStorage.removeItem(key) } catch {}
}

export function getAccessToken(): string | null {
  // 兼容旧key与聚合存储
  const fromPrimary = safeGet<string>(ACCESS_TOKEN_KEY)
  if (fromPrimary) return fromPrimary

  // 兼容 rideService 早期使用的 key
  const fromLegacy = safeGet<string>('auth_token')
  if (fromLegacy) return fromLegacy

  const appInfo = safeGet<UserAppInfo>(USER_APP_INFO_KEY) || safeGet<UserAppInfo>('ROOT_APP_INFO')
  if (appInfo?.token) return appInfo.token
  return null
}

export function getRefreshToken(): string | null {
  const fromPrimary = safeGet<string>(REFRESH_TOKEN_KEY)
  if (fromPrimary) return fromPrimary

  const appInfo = safeGet<UserAppInfo>(USER_APP_INFO_KEY) || safeGet<UserAppInfo>('ROOT_APP_INFO')
  if (appInfo?.refreshToken) return appInfo.refreshToken as string
  return null
}

export function setTokens(accessToken: string, refreshToken?: string, userInfo?: any) {
  if (accessToken) safeSet(ACCESS_TOKEN_KEY, accessToken)
  if (refreshToken) safeSet(REFRESH_TOKEN_KEY, refreshToken)
  // 聚合存储便于统一读取
  const info: UserAppInfo = { token: accessToken, refreshToken, userInfo }
  safeSet(USER_APP_INFO_KEY, info)
}

export function removeTokens() {
  safeRemove(ACCESS_TOKEN_KEY)
  safeRemove(REFRESH_TOKEN_KEY)
  safeRemove(USER_APP_INFO_KEY)
}

// 解析 JWT 的 payload
function decodeJwtPayload(token: string): any | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = parts[1]
    const json = JSON.parse(decodeURIComponent(escape(atob(payload))))
    return json
  } catch {
    return null
  }
}

export function isTokenExpired(token?: string | null): boolean {
  const t = token ?? getAccessToken()
  if (!t) return true
  const payload = decodeJwtPayload(t)
  if (!payload || typeof payload.exp !== 'number') {
    // 无法解析或非JWT，视为未过期（交由服务端校验）
    return false
  }
  const nowSec = Math.floor(Date.now() / 1000)
  return payload.exp <= nowSec
}

export function isAuthenticated(): boolean {
  const token = getAccessToken()
  if (!token) return false
  return !isTokenExpired(token)
}

// 构造通用认证头
export function getAuthHeader(): Record<string, string> {
  const token = getAccessToken()
  if (!token) return {}
  // 统一使用 Bearer 方案
  return { Authorization: `Bearer ${token}` }
}

// 便捷断言（可在需要登录的页面/接口前调用）
export function assertAuthenticated(): void {
  if (!isAuthenticated()) {
    throw new Error('未登录或登录已过期')
  }
}