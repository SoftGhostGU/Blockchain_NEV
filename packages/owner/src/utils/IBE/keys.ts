export const PUBLIC_KEY = "TEST_PUBLIC_KEY_123456"; // 测试用公钥

// 动态私钥生成函数
export const generatePrivateKey = (userIdentity: string): string => {
  return `PRIV_KEY_${userIdentity}`;
};

// 获取用户私钥（优先从浏览器存储获取，不存在则动态生成）
export const getUserPrivateKey = (userIdentity: string): string => {
  // 先尝试从浏览器存储获取
  const storedKey = localStorage.getItem(`USER_PRIVATE_KEY_${userIdentity}`);
  if (storedKey) {
    return storedKey;
  }
  
  // 如果不存在，动态生成
  return generatePrivateKey(userIdentity);
};

// 存储用户私钥到浏览器
export const storeUserPrivateKey = (userIdentity: string, privateKey?: string): void => {
  const keyToStore = privateKey || generatePrivateKey(userIdentity);
  localStorage.setItem(`USER_PRIVATE_KEY_${userIdentity}`, keyToStore);
};

// 移除用户私钥
export const removeUserPrivateKey = (userIdentity: string): void => {
  localStorage.removeItem(`USER_PRIVATE_KEY_${userIdentity}`);
};