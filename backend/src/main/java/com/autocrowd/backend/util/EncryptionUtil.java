package com.autocrowd.backend.util;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.HashSet;
import java.util.Set;

/**
 * 简化的加密工具类
 * 提供基础的加密解密功能，方便业务逻辑使用
 */
public class EncryptionUtil {
    
    /**
     * 生成AES密钥
     * @return 生成的密钥（Base64编码）
     */
    public static String generateKey() {
        try {
            KeyGenerator keyGen = KeyGenerator.getInstance("AES");
            keyGen.init(256, new SecureRandom());
            SecretKey key = keyGen.generateKey();
            return Base64.getEncoder().encodeToString(key.getEncoded());
        } catch (Exception e) {
            throw new RuntimeException("生成密钥失败: " + e.getMessage(), e);
        }
    }
    
    /**
     * 导入密钥
     * @param keyBase64 Base64编码的密钥
     * @return SecretKey对象
     */
    public static SecretKey importKey(String keyBase64) {
        try {
            byte[] keyBytes = Base64.getDecoder().decode(keyBase64);
            return new SecretKeySpec(keyBytes, "AES");
        } catch (Exception e) {
            throw new RuntimeException("导入密钥失败: " + e.getMessage(), e);
        }
    }
    
    /**
     * 加密数据
     * @param data 明文数据
     * @param key 密钥
     * @return 加密后的数据（Base64编码）
     */
    public static String encrypt(String data, SecretKey key) {
        try {
            Cipher cipher = Cipher.getInstance("AES");
            cipher.init(Cipher.ENCRYPT_MODE, key);
            byte[] encryptedBytes = cipher.doFinal(data.getBytes());
            return Base64.getEncoder().encodeToString(encryptedBytes);
        } catch (Exception e) {
            throw new RuntimeException("加密失败: " + e.getMessage(), e);
        }
    }
    
    /**
     * 解密数据
     * @param encryptedData 加密的数据（Base64编码）
     * @param key 密钥
     * @return 解密后的明文数据
     */
    public static String decrypt(String encryptedData, SecretKey key) {
        try {
            byte[] encryptedBytes = Base64.getDecoder().decode(encryptedData);
            Cipher cipher = Cipher.getInstance("AES");
            cipher.init(Cipher.DECRYPT_MODE, key);
            byte[] decryptedBytes = cipher.doFinal(encryptedBytes);
            return new String(decryptedBytes);
        } catch (Exception e) {
            throw new RuntimeException("解密失败: " + e.getMessage(), e);
        }
    }
    
    /**
     * 验证用户是否有访问权限
     * @param allowedUserIds 允许访问的用户ID列表
     * @param allowedDriverIds 允许访问的车主ID列表
     * @param currentUserId 当前用户ID
     * @param currentDriverId 当前车主ID
     * @param isDriver 是否为车主
     * @return 是否有访问权限
     */
    public static boolean hasAccess(String allowedUserIds, String allowedDriverIds, 
                                   Long currentUserId, Long currentDriverId, boolean isDriver) {
        if (isDriver) {
            // 车主访问检查
            return allowedDriverIds != null && !allowedDriverIds.isEmpty() && 
                   Long.valueOf(allowedDriverIds).equals(currentDriverId);
        } else {
            // 用户访问检查
            return allowedUserIds != null && !allowedUserIds.isEmpty() && 
                   Long.valueOf(allowedUserIds).equals(currentUserId);
        }
    }
}