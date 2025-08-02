import { request } from './request';
import { emailSchema, passwordSchema, usernameSchema, verificationCodeSchema } from './commons/index'
import { useUserStore } from '../store/user';
import { showToast, setStorageSync } from '@tarojs/taro';

export const login = async (username, password) => {
  const data = {
    username: usernameSchema.parse(username),
    password: passwordSchema.parse(password)
  }
  const { data: result } = await request('/user/login', 'POST', data);
  setStorageSync('accessToken', result.data.accessToken);
  setStorageSync('refreshToken', result.data.refreshToken);
  useUserStore.getState().setUserInfo(result.data.info);
  return result;
};

export const requestVerificationCode = async (form) => {
  const data = {
    email: emailSchema.parse(form.email)
  }
  usernameSchema.parse(form.username)
  passwordSchema.parse(form.password)
  if (form.password != form.checkPassword) {
    throw Error('密码不一致！')
  }
  const { data: result } = await request('/user/code/register', 'POST', data)
  return result;
}

export const register = async (args) => {
  const data = {
    email: emailSchema.parse(args.email),
    username: usernameSchema.parse(args.username),
    password: passwordSchema.parse(args.password),
    verifyCode: verificationCodeSchema.parse(args.verifyCode)
  }
  if (data.password != args.checkPassword) {
    throw Error('密码不一致！')
  }
  const { data: result } = await request('/user/register', 'POST', data)
  setStorageSync('accessToken', result.data.accessToken);
  setStorageSync('refreshToken', result.data.refreshToken);
  useUserStore.getState().setUserInfo(result.data.info);
  return result;
}
