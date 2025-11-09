import { getStorage, setStorageSync, request as rawRequest, showToast, navigateTo } from '@tarojs/taro';
// 中文注释：统一从 token 工具读取认证信息，避免不同存储键名导致请求未携带 Authorization。
import { getAuthHeader, getAccessToken as tokenGetAccessToken, getRefreshToken as tokenGetRefreshToken } from '@/utils/request/token'

let isRefreshingToken = false;
const API_BASE_URL = process.env.NODE_ENV === 'development' ? '/api' : 'http://10.147.17.1:8080';

// 中文注释：保留原有异步读取 accessToken 的导出以兼容旧代码，但内部发送请求不再依赖此方法。
export const getAccessToken = async () => {
  return await getStorage({ key: 'accessToken' }).then(res => res.data).catch(() => '');
};

const getRefreshToken = async () => {
  return await getStorage({ key: 'refreshToken' }).then(res => res.data).catch(() => '');
};

export const request = async (url, method = 'GET', data = {}, opts = {}) => {
  // 中文注释：
  // 1) 统一使用 token 工具提供的 getAuthHeader() 构造认证头，
  //    支持从多处存储（TaroStorage/localStorage/聚合键）读取，提升鲁棒性。
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
  };
  // 便于调试：打印最终请求头（已做脱敏，不暴露敏感信息）
  const safeHeadersLog = (() => {
    const h = { ...headers }
    if (h.Authorization) {
      // 中文注释：仅显示前缀，隐藏真实 token 内容，避免泄露。
      h.Authorization = 'Bearer ***'
    }
    return h
  })()

  if (isRefreshingToken) {
    headers['x-refresh-token'] = tokenGetRefreshToken() || '';
  }
  console.log('request headers', safeHeadersLog);

  const finalUrl = url.startsWith('http')
    ? url
    : (API_BASE_URL === '/api' && url.startsWith('/api')
        ? url
        : `${API_BASE_URL}${url}`);
  console.log('request url', finalUrl, 'method', method, 'data', data);

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
  } else if (res.statusCode >= 300 || res.statusCode < 200 || (!opts?.acceptPlain && res.data.code != 0)) {
    // 中文注释：
    // 2) 如果后端返回非 2xx 或业务 code != 0，优先展示后端 message，
    //    若无 message，则拼接 HTTP 状态码，便于定位。
    const errMsg = (res?.data && (res.data.message || res.data.msg)) || `请求失败(${res.statusCode})`
    throw Error(errMsg)
  } else {
    // 中文注释：
    // 3) 仅在未显式要求静默时才展示成功提示。
    const silent = !!opts?.silentSuccess
    if (!silent) {
      showToast({
        icon: 'success',
        title: res.data.message || '请求成功'
      })
    }
  }
  console.log(res.data)
  return res
};
