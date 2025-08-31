import type { CiphertextObject } from './types';
import { base64ToUtf8 } from './base64Utils';
import { sensitiveFields } from '../../config/sensitiveFields';
import { USER_KEYS } from './keys';

/**
 * 收到来自后端的数据之后，解密敏感数据
 * @param ciphertextObj 加密密文对象
 * @param userIdentity 用户身份，用于检查是否满足IBE的访问策略
 * @returns 解密后的数据 or null（无权限）
 */
export function decrypt(
  ciphertextObj: CiphertextObject,
  userIdentity: string
): Record<string, string> | null {
  const decrypted: Record<string, string> = {};
  const policy = ciphertextObj['access_policy'] as string;

  // 检查用户私钥是否存在
  const userPrivKey = USER_KEYS[userIdentity];
  if (!userPrivKey) return { "解密错误": "用户私钥不存在" };

  // 解析 OR 策略
  const allowed = policy
    .split(/OR/i)
    .map(s => s.trim().replace(/^\(|\)$/g, ''));

  const cleanedUserId = userIdentity.trim().toUpperCase();
  const cleanedAllowed = allowed.map(s => s.trim().toUpperCase());

  if (!cleanedAllowed.includes(cleanedUserId)) return { "解密错误": "用户无需要的解密权限" };

  // 遍历数据
  for (const key in ciphertextObj) {
    if (key === 'access_policy') {
      decrypted[key] = policy;
      continue;
    }

    const value = ciphertextObj[key];

    // 如果是敏感字段，解密
    if (sensitiveFields.includes(key) && typeof value === 'string') {
      const decoded = base64ToUtf8(value);
      const [plain] = decoded.split('|'); // 去掉 policy + 公钥
      decrypted[key] = plain;
    } else {
      decrypted[key] = value as string;
    }
  }

  return decrypted;
}
