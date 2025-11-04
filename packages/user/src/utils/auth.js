import { request } from './request';
import { passwordSchema } from './commons/index'
import { useUserStore } from '../store/user';
import { showToast, reLaunch } from '@tarojs/taro';
import { setTokens } from '../utils/request/token';

export const login = async (phone, password) => {
  const data = {
    phone: String(phone),
    password: passwordSchema.parse(password)
  }
  // 对接后端：POST http://10.147.17.1:8080/api/user/login
  const { data: result } = await request('/api/user/login', 'POST', data);

  // 期望返回：{ code: 0, data: { user: {...}, token: '...' } }
  if (result && (result.code === 0 || result.code === 200) && result.data?.token) {
    setTokens(result.data.token, undefined, result.data.user);
    useUserStore.getState().setUserInfo(result.data.user);
    showToast({ title: '登录成功', icon: 'success' });
  }
  return result;
};

export const requestVerificationCode = async (form) => {
  const data = {
    email: form.email
  }
  if (form.password != form.checkPassword) {
    throw Error('密码不一致！')
  }
  const { data: result } = await request('/user/code/register', 'POST', data)
  return result;
}

export const register = async (args) => {
  //
  // 注册接口对接说明（依据提供的接口文档）：
  // - 请求 URL（绝对地址，避免开发代理影响）：
  //   http://127.0.0.1:4523/m1/6681778-6391029-default/api/user/register
  // - 请求 Body（JSON）：{ phone, password, username }
  // - 响应结构：
  //   { code: 0, data: { user: { user_id, username, credit_score, balance }, token: '...' } }
  // - 成功后：保存 token 与用户信息到本地，并可跳转到主页面

  const data = {
    phone: String(args.phone || ''),
    username: String(args.username || ''),
    password: String(args.password || '')
  }

  // 基础校验：确认密码一致（若传入了 checkPassword）
  if (typeof args.checkPassword === 'string' && data.password !== args.checkPassword) {
    throw Error('密码不一致！')
  }

  // 解决 H5 跨域（CORS）方案：
  // 1) 开发环境通过 Taro H5 的 devServer.proxy 将以 "/api" 开头的请求反向代理到 http://10.147.17.1:8080
  // 2) 因此这边使用相对路径 "/api/user/register"，浏览器同源访问到本地 H5 服务，再由代理转发到后端，避免预检（OPTIONS）被 405/CORS 拦截
  const REGISTER_URL = '/api/user/register'
  const { data: result } = await request(REGISTER_URL, 'POST', data)

  // 若返回包含 token 与用户数据，则统一保存并提示成功
  if (result && (result.code === 0 || result.code === 200) && result.data?.token) {
    setTokens(result.data.token, undefined, result.data.user);
    useUserStore.getState().setUserInfo(result.data.user);
    showToast({ title: '注册成功', icon: 'success' });
    // 可选择直接进入主页面以提升体验
    reLaunch({ url: '/pages/ride/index' })
  }
  return result;
}
