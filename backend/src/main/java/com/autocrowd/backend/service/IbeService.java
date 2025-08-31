package com.autocrowd.backend.service;

import org.springframework.stereotype.Service;

import java.math.BigInteger;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.Base64;

@Service
public class IbeService {

    // 实际项目中应使用成熟的IBE库（如PBC库的Java封装）
    // 这里使用简化的实现来模拟IBE功能
    private final Map<String, byte[]> privateKeyCache = new ConcurrentHashMap<>();
    private byte[] masterKey;
    private byte[] publicKey;

    public IbeService() {
        initializeMasterKey();
    }

    /**
     * 初始化主密钥
     */
    private void initializeMasterKey() {
        // 生成随机主密钥
        try {
            SecureRandom random = new SecureRandom();
            this.masterKey = new byte[32];
            random.nextBytes(this.masterKey);
            
            // 从主密钥派生公钥
            MessageDigest sha256 = MessageDigest.getInstance("SHA-256");
            this.publicKey = sha256.digest(this.masterKey);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Failed to initialize IBE keys", e);
        }
    }

    /**
     * 获取公钥
     * @return Base64编码的公钥
     */
    public String getPublicKey() {
        return Base64.getEncoder().encodeToString(this.publicKey);
    }

    /**
     * 为指定属性生成私钥
     * @param attribute 用户属性
     * @return 包含属性和私钥的映射
     */
    public Map<String, Object> generatePrivateKey(String attribute) {
        if (privateKeyCache.containsKey(attribute)) {
            throw new RuntimeException("Private key already generated for attribute: " + attribute);
        }
        
        // 根据主密钥和用户属性生成私钥
        byte[] privateKey = derivePrivateKey(this.masterKey, attribute);
        String base64PrivateKey = Base64.getEncoder().encodeToString(privateKey);
        privateKeyCache.put(attribute, privateKey);
        
        return Map.of(
            "attribute", attribute,
            "private_key", base64PrivateKey
        );
    }

    /**
     * 根据主密钥和用户属性派生私钥
     * @param masterKey 主密钥
     * @param attribute 用户属性
     * @return 私钥
     */
    private byte[] derivePrivateKey(byte[] masterKey, String attribute) {
        try {
            // 使用HMAC-SHA256派生私钥
            MessageDigest sha256 = MessageDigest.getInstance("SHA-256");
            sha256.update(masterKey);
            sha256.update(attribute.getBytes(StandardCharsets.UTF_8));
            return sha256.digest();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Failed to derive private key", e);
        }
    }

    /**
     * 检查用户是否有权限访问特定数据
     * @param accessPolicy 访问策略（布尔表达式）
     * @param userAttribute 用户属性
     * @return 是否有访问权限
     */
    public boolean checkAccess(String accessPolicy, String userAttribute) {
        // 解析布尔表达式，支持 AND/OR
        // 示例：(USER_1) OR (DRIVER_67890) OR (ADMIN)
        List<String> roles = extractRoles(accessPolicy);
        return roles.contains(userAttribute);
    }

    /**
     * 从访问策略中提取角色
     * @param policy 访问策略
     * @return 角色列表
     */
    private List<String> extractRoles(String policy) {
        List<String> roles = new ArrayList<>();
        // 简单正则提取括号内的内容
        Pattern pattern = Pattern.compile("\\(([^)]+)\\)");
        Matcher matcher = pattern.matcher(policy);
        while (matcher.find()) {
            roles.add(matcher.group(1).trim());
        }
        return roles;
    }
    
    /**
     * 使用IBE加密数据
     * @param plaintext 明文数据
     * @param attribute 用户属性
     * @return 加密后的数据(Base64编码)
     */
    public String encrypt(String plaintext, String attribute) {
        try {
            // 简化的IBE加密实现
            MessageDigest sha256 = MessageDigest.getInstance("SHA-256");
            sha256.update(publicKey);
            sha256.update(attribute.getBytes(StandardCharsets.UTF_8));
            byte[] encryptionKey = sha256.digest();
            
            // 使用简单的XOR加密作为示例
            byte[] plaintextBytes = plaintext.getBytes(StandardCharsets.UTF_8);
            byte[] ciphertext = new byte[plaintextBytes.length];
            
            for (int i = 0; i < plaintextBytes.length; i++) {
                ciphertext[i] = (byte) (plaintextBytes[i] ^ encryptionKey[i % encryptionKey.length]);
            }
            
            return Base64.getEncoder().encodeToString(ciphertext);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Failed to encrypt data", e);
        }
    }
    
    /**
     * 使用IBE解密数据
     * @param ciphertext 加密数据(Base64编码)
     * @param attribute 用户属性
     * @return 解密后的明文数据
     */
    public String decrypt(String ciphertext, String attribute) {
        try {
            // 简化的IBE解密实现
            byte[] cipherBytes = Base64.getDecoder().decode(ciphertext);
            
            MessageDigest sha256 = MessageDigest.getInstance("SHA-256");
            sha256.update(publicKey);
            sha256.update(attribute.getBytes(StandardCharsets.UTF_8));
            byte[] decryptionKey = sha256.digest();
            
            // 使用相同的XOR操作解密
            byte[] plaintextBytes = new byte[cipherBytes.length];
            for (int i = 0; i < cipherBytes.length; i++) {
                plaintextBytes[i] = (byte) (cipherBytes[i] ^ decryptionKey[i % decryptionKey.length]);
            }
            
            return new String(plaintextBytes, StandardCharsets.UTF_8);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Failed to decrypt data", e);
        }
    }
}