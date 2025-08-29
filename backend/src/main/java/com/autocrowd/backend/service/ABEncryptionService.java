package com.autocrowd.backend.service;

public interface ABEncryptionService {
    /**
     * 使用ABE加密数据，只有指定属性的用户可以解密
     * @param data 需要加密的数据
     * @param attributes 访问控制属性（如"USER"、"DRIVER"等）
     * @return 加密后的数据
     */
    String encrypt(String data, String... attributes);

    /**
     * 使用指定用户的私钥解密数据
     * @param encryptedData 加密的数据
     * @param userAttributes 用户拥有的属性
     * @return 解密后的原始数据
     * @throws Exception 解密失败时抛出异常
     */
    String decrypt(String encryptedData, String... userAttributes) throws Exception;
}