import { getStorage, setStorageSync, request as rawRequest, showToast, navigateTo } from '@tarojs/taro';

let isRefreshingToken = false;
const API_BASE_URL = process.env.NODE_ENV === 'development' ? '/api' : 'http://10.147.17.1:8080';

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
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  if (isRefreshingToken) {
    headers['x-refresh-token'] = await getRefreshToken();
    console.log('refreshToken', headers['x-refresh-token']);
  }
  console.log('request headers', headers);

  const finalUrl = url.startsWith('http')
    ? url
    : (API_BASE_URL === '/api' && url.startsWith('/api')
        ? url
        : `${API_BASE_URL}${url}`);

  // 加入显式超时与网络错误兜底，避免界面一直 loading
  let res;
  try {
    res = await rawRequest({
      url: finalUrl, // 支持绝对地址或拼接到基础地址
      method,
      data,
      header: headers,
      timeout: 10000, // 10s 超时，后端无响应时尽快失败
    })
  } catch (e) {
    isRefreshingToken = false;
    showToast({ title: '网络异常或服务器不可达', icon: 'none' });
    throw e;
  }

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
    throw Error(res.data.message || '请求失败')
  } else {
    showToast({
      icon: 'success',
      title: res.data.message || '请求成功'
    })
  }
  console.log(res.data)
  return res
};
