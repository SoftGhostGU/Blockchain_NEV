import { request } from './request';
import { passwordSchema } from './commons/index'
import { useUserStore } from '../store/user';
import { showToast } from '@tarojs/taro';
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
  const data = {
    email: args.email,
    username: args.username,
    password: args.password,
    verifyCode: args.verifyCode
  }
  if (data.password != args.checkPassword) {
    throw Error('密码不一致！')
  }
  const { data: result } = await request('/user/register', 'POST', data)
  // 保持现有注册逻辑不动（如需对接可类似登录改造）
  return result;
}
