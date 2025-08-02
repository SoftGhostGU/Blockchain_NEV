import { getStorage, setStorageSync, request as rawRequest, showToast, navigateTo } from '@tarojs/taro';

let isRefreshingToken = false;

export const getAccessToken = async () => {
  return await getStorage({ key: 'accessToken' }).then(res => res.data).catch(() => '');
};

const getRefreshToken = async () => {
  return await getStorage({ key: 'refreshToken' }).then(res => res.data).catch(() => '');
};

export const request = async (url, method = 'GET', data = {}) => {
  const accessToken = await getAccessToken();
  const headers = {
    'Content-Type': 'application/json'
  };
  console.log('accessToken', accessToken);
  headers['Authorization'] = accessToken;


  if (isRefreshingToken) {
    headers['x-refresh-token'] = await getRefreshToken();
    console.log('refreshToken', headers['x-refresh-token']);
  }
  console.log('request headers', headers);
  const res = await rawRequest({
    url: `http://localhost:8080${url}`, // 未来需要替换为实际的API地址
    method,
    data,
    header: headers
  })
  if (isRefreshingToken && res.header['x-access-token']) {
    setStorageSync('accessToken', res.header['x-access-token']);
  }
  if (res.statusCode === 401) {
    if (!isRefreshingToken) {
      isRefreshingToken = true;
      const r = await request(url, method, data)
      isRefreshingToken = false;
      return r;
    } else {
      isRefreshingToken = false;
      showToast({
        title: '登录已过期，请重新登录',
        icon: 'none'
      });
      navigateTo({ url: '/pages/login/index' });
    }
  } else if (res.statusCode >= 300 || res.statusCode < 200 || res.data.code != 0) {
    throw Error(res.data.message)
  } else {
    showToast({
      icon: 'success',
      title: res.data.message
    })
  }
  console.log(res.data)
  return res
};
