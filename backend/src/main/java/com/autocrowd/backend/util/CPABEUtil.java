package com.autocrowd.backend.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * CP-ABE工具类
 * 实现基于属性的加密功能，特别是密文策略属性基加密（CP-ABE）
 * 用于保护订单中的敏感数据
 */
@Component
public class CPABEUtil {
    
    private static final Logger logger = LoggerFactory.getLogger(CPABEUtil.class);
    
    /**
     * 生成CP-ABE主密钥
     * @return 主密钥（Base64编码）
     */
    public static String generateMasterKey() {
        try {
            KeyGenerator keyGen = KeyGenerator.getInstance("AES");
            keyGen.init(256, new SecureRandom());
            SecretKey key = keyGen.generateKey();
            return Base64.getEncoder().encodeToString(key.getEncoded());
        } catch (Exception e) {
            logger.error("生成主密钥失败: {}", e.getMessage(), e);
            throw new RuntimeException("生成主密钥失败: " + e.getMessage(), e);
        }
    }
    
    /**
     * 生成CP-ABE公钥
     * @return 公钥（Base64编码）
     */
    public static String generatePublicKey() {
        return EncryptionUtil.generateKey();
    }
    
    /**
     * 基于主密钥和属性生成属性密钥
     * @param masterKey 主密钥
     * @param attribute 属性
     * @return 属性密钥（Base64编码）
     */
    public static String generateAttributeKey(String masterKey, String attribute) {
        try {
            // 简化实现：使用主密钥和属性的某种组合生成属性密钥
            String combined = masterKey + attribute;
            return Base64.getEncoder().encodeToString(combined.getBytes());
        } catch (Exception e) {
            logger.error("生成属性密钥失败: {}", e.getMessage(), e);
            throw new RuntimeException("生成属性密钥失败: " + e.getMessage(), e);
        }
    }
    
    /**
     * 使用CP-ABE加密数据
     * 注意：这是简化实现，实际应用中应使用专门的CP-ABE库
     * @param data 明文数据
     * @param publicKey 公钥
     * @param accessPolicy 访问策略
     * @return 加密后的数据（Base64编码）
     */
    public static String encrypt(String data, String publicKey, String accessPolicy) {
        try {
            // 简化实现：将访问策略附加到加密数据中
            String combinedData = data + "|POLICY:" + accessPolicy;
            
            byte[] keyBytes = Base64.getDecoder().decode(publicKey);
            SecretKey key = new SecretKeySpec(keyBytes, "AES");
            
            Cipher cipher = Cipher.getInstance("AES");
            cipher.init(Cipher.ENCRYPT_MODE, key);
            byte[] encryptedBytes = cipher.doFinal(combinedData.getBytes());
            return Base64.getEncoder().encodeToString(encryptedBytes);
        } catch (Exception e) {
            logger.error("CP-ABE加密失败: {}", e.getMessage(), e);
            throw new RuntimeException("CP-ABE加密失败: " + e.getMessage(), e);
        }
    }
    
    /**
     * 使用CP-ABE解密数据
     * 注意：这是简化实现，实际应用中应使用专门的CP-ABE库
     * @param encryptedData 加密的数据（Base64编码）
     * @param attributeKeys 属性密钥列表
     * @param userAttribute 用户属性
     * @return 解密后的明文数据
     */
    public static String decrypt(String encryptedData, String[] attributeKeys, String userAttribute) {
        // 简化实现：直接使用属性密钥解密
        // 在实际CP-ABE实现中，需要检查用户属性是否满足访问策略
        try {
            for (String attributeKey : attributeKeys) {
                try {
                    byte[] encryptedBytes = Base64.getDecoder().decode(encryptedData);
                    byte[] keyBytes = Base64.getDecoder().decode(attributeKey);
                    SecretKey key = new SecretKeySpec(keyBytes, "AES");
                    
                    Cipher cipher = Cipher.getInstance("AES");
                    cipher.init(Cipher.DECRYPT_MODE, key);
                    byte[] decryptedBytes = cipher.doFinal(encryptedBytes);
                    
                    String combinedData = new String(decryptedBytes);
                    // 检查访问策略是否满足
                    if (combinedData.contains("|POLICY:" + userAttribute) || 
                        combinedData.contains("|POLICY:(" + userAttribute + ")")) {
                        // 移除策略部分，只返回原始数据
                        int policyIndex = combinedData.indexOf("|POLICY:");
                        if (policyIndex != -1) {
                            return combinedData.substring(0, policyIndex);
                        }
                        return combinedData;
                    }
                } catch (Exception e) {
                    // 当前属性密钥无法解密，尝试下一个
                    logger.debug("使用属性密钥解密失败: {}", e.getMessage());
                }
            }
            
            throw new RuntimeException("解密失败：没有合适的属性密钥或不满足访问策略");
        } catch (Exception e) {
            logger.error("CP-ABE解密失败: {}", e.getMessage(), e);
            throw new RuntimeException("CP-ABE解密失败: " + e.getMessage(), e);
        }
    }
}