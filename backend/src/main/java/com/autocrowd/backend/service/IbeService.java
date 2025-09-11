package com.autocrowd.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.Base64;

/**
 * 基于身份的加密（IBE）服务
 * 
 * 提供完整的IBE功能，包括：
 * 1. 公钥/私钥生成
 * 2. 数据加密/解密
 * 3. 访问控制检查
 */
@Service
public class IbeService {
    
    private static final Logger logger = LoggerFactory.getLogger(IbeService.class);

    // 实际项目中使用成熟的IBE库
    private final PairingBasedCryptosystem pbc;
    
    // 缓存已生成的私钥
    private final Map<String, byte[]> privateKeyCache = new ConcurrentHashMap<>();
    private String masterKey;
    private String publicKey;

    @Autowired
    public IbeService(PairingBasedCryptosystem pbc) {
        this.pbc = pbc;
        initializeMasterKey();
        logger.info("IBE服务初始化完成");
    }

    /**
     * 初始化主密钥
     */
    private void initializeMasterKey() {
        logger.debug("正在初始化IBE主密钥");
        try {
            // 使用成熟的IBE库生成主密钥和公钥
            this.masterKey = pbc.generateMasterKey();
            this.publicKey = pbc.derivePublicKey(masterKey);
            logger.debug("IBE主密钥初始化成功");
        } catch (Exception e) {
            logger.error("初始化IBE密钥时发生错误", e);
            throw new RuntimeException("Failed to initialize IBE keys", e);
        }
    }

    /**
     * 获取公钥
     * @return Base64编码的公钥
     */
    public String getPublicKey() {
        logger.debug("获取公钥");
        return publicKey;
    }

    /**
     * 为指定属性生成私钥
     * @param attribute 用户属性
     * @return 包含属性和私钥的映射
     */
    public Map<String, Object> generatePrivateKey(String attribute) {
        logger.debug("为属性 {} 生成私钥", attribute);
        
        if (privateKeyCache.containsKey(attribute)) {
            logger.warn("属性 {} 的私钥已存在", attribute);
            throw new RuntimeException("Private key already generated for attribute: " + attribute);
        }
        
        // 使用成熟的IBE库生成私钥
        byte[] privateKey = pbc.generatePrivateKey(masterKey, attribute);
        String base64PrivateKey = Base64.getEncoder().encodeToString(privateKey);
        privateKeyCache.put(attribute, privateKey);
        
        logger.info("成功为属性 {} 生成私钥", attribute);
        
        return Map.of(
            "attribute", attribute,
            "private_key", base64PrivateKey
        );
    }

    /**
     * 检查用户是否有权限访问特定数据
     * @param accessPolicy 访问策略（布尔表达式）
     * @param userAttribute 用户属性
     * @return 是否有访问权限
     */
    public boolean checkAccess(String accessPolicy, String userAttribute) {
        logger.debug("检查属性 {} 对策略 {} 的访问权限", userAttribute, accessPolicy);
        // 解析布尔表达式，支持 AND/OR
        // 示例：(USER_1) OR (DRIVER_67890) OR (ADMIN)
        List<String> roles = extractRoles(accessPolicy);
        boolean hasAccess = roles.contains(userAttribute);
        logger.info("属性 {} {} 访问权限", userAttribute, hasAccess ? "有" : "无");
        return hasAccess;
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
        logger.debug("从策略 {} 中提取到角色: {}", policy, roles);
        return roles;
    }
    
    /**
     * 使用IBE加密数据
     * @param plaintext 明文数据
     * @param attribute 用户属性
     * @return 加密后的数据(Base64编码)
     */
    public String encrypt(String plaintext, String attribute) {
        logger.debug("使用属性 {} 加密数据", attribute);
        try {
            // 使用成熟的IBE库加密数据
            String ciphertext = pbc.encrypt(plaintext, attribute, publicKey);
            logger.info("数据加密成功，明文长度: {}，密文长度: {}", plaintext.length(), ciphertext.length());
            return ciphertext;
        } catch (Exception e) {
            logger.error("加密数据时发生错误", e);
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
        logger.debug("使用属性 {} 解密数据", attribute);
        try {
            // 从缓存中获取私钥
            byte[] privateKey = privateKeyCache.get(attribute);
            if (privateKey == null) {
                logger.warn("未找到属性 {} 的私钥", attribute);
                throw new RuntimeException("Private key not found for attribute: " + attribute);
            }
            
            // 使用成熟的IBE库解密数据
            String plaintext = pbc.decrypt(ciphertext, attribute, privateKey, publicKey);
            logger.info("数据解密成功，密文长度: {}，明文长度: {}", ciphertext.length(), plaintext.length());
            return plaintext;
        } catch (Exception e) {
            logger.error("解密数据时发生错误", e);
            throw new RuntimeException("Failed to decrypt data", e);
        }
    }
}