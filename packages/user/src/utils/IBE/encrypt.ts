<<<<<<< HEAD
import { utf8ToBase64 } from './base64Utils';
import type { CiphertextObject, AccessPolicy } from './types';
import { sensitiveFields } from '../../config/sensitiveFields';
import { PUBLIC_KEY } from './keys';

/**
 * 在向后端发送请求之前，加密敏感数据
 * @param data 原始数据，会遍历查询是否在敏感信息列表里，如果在就加密
 * @param policy IBE的访问策略
 * @returns 加密后的数据
 */
export function encrypt(
  data: Record<string, string>,
  policy: AccessPolicy
): CiphertextObject {
  const result: CiphertextObject = { ...data };

  for (const key in data) {
    if (sensitiveFields.includes(key)) {
      // 明文 + policy + 公钥
      const cipherText = utf8ToBase64(`${data[key]}|${policy}|${PUBLIC_KEY}`);
      result[key] = cipherText;
    }
  }

  // 存策略
  result['access_policy'] = policy;
  return result;
}
=======
import { utf8ToBase64 } from './base64Utils';
import type { CiphertextObject, AccessPolicy } from './types';
import { sensitiveFields } from '../../config/sensitiveFields';
import { PUBLIC_KEY } from './keys';

/**
 * 在向后端发送请求之前，加密敏感数据
 * @param data 原始数据，会遍历查询是否在敏感信息列表里，如果在就加密
 * @param policy IBE的访问策略
 * @returns 加密后的数据
 */
export function encrypt(
  data: Record<string, string>,
  policy: AccessPolicy
): CiphertextObject {
  const result: CiphertextObject = { ...data };

  for (const key in data) {
    if (sensitiveFields.includes(key)) {
      // 明文 + policy + 公钥
      const cipherText = utf8ToBase64(`${data[key]}|${policy}|${PUBLIC_KEY}`);
      result[key] = cipherText;
    }
  }

  // 存策略
  result['access_policy'] = policy;
  return result;
}
>>>>>>> f653e29b051de083bf1aada7143d9029c137a914
