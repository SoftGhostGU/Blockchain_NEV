package com.autocrowd.backend.service.impl;

import com.autocrowd.backend.service.ABEncryptionService;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.security.SecureRandom;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Base64;

@Service
public class ABEncryptionServiceImpl implements ABEncryptionService {
    
    // 密钥存储（实际应用中应使用更安全的存储方式）
    private Map<String, SecretKey> attributeKeys = new ConcurrentHashMap<>();
    
    // 初始化系统密钥
    @PostConstruct
    public void init() {
        try {
            // 为常见属性生成密钥
            generateAttributeKey("USER");
            generateAttributeKey("DRIVER");
            generateAttributeKey("ADMIN");
        } catch (Exception e) {
            throw new RuntimeException("初始化ABE系统失败", e);
        }
    }
    
    /**
     * 为指定属性生成密钥
     * @param attribute 属性名称
     * @return 生成的密钥（Base64编码）
     */
    public String generateAttributeKey(String attribute) {
        try {
            KeyGenerator keyGen = KeyGenerator.getInstance("AES");
            keyGen.init(256, new SecureRandom());
            SecretKey key = keyGen.generateKey();
            attributeKeys.put(attribute.toUpperCase(), key);
            
            // 返回Base64编码的密钥以便存储或传输
            return Base64.getEncoder().encodeToString(key.getEncoded());
        } catch (Exception e) {
            throw new RuntimeException("生成属性密钥失败: " + attribute, e);
        }
    }
    
    /**
     * 导入属性密钥
     * @param attribute 属性名称
     * @param keyBase64 Base64编码的密钥
     */
    public void importAttributeKey(String attribute, String keyBase64) {
        try {
            byte[] keyBytes = Base64.getDecoder().decode(keyBase64);
            SecretKey key = new SecretKeySpec(keyBytes, "AES");
            attributeKeys.put(attribute.toUpperCase(), key);
        } catch (Exception e) {
            throw new RuntimeException("导入属性密钥失败: " + attribute, e);
        }
    }
    
    /**
     * 获取属性密钥（Base64编码）
     * @param attribute 属性名称
     * @return Base64编码的密钥
     */
    public String getAttributeKey(String attribute) {
        SecretKey key = attributeKeys.get(attribute.toUpperCase());
        if (key == null) {
            return null;
        }
        return Base64.getEncoder().encodeToString(key.getEncoded());
    }
    
    @Override
    public String encrypt(String data, String... attributes) {
        try {
            if (attributes.length == 0) {
                throw new RuntimeException("至少需要指定一个属性");
            }
            
            // 创建访问结构（这里简化为属性列表）
            Set<String> attributeSet = new HashSet<>();
            for (String attr : attributes) {
                attributeSet.add(attr.toUpperCase());
            }
            
            // 生成随机数据密钥用于加密实际数据
            KeyGenerator keyGen = KeyGenerator.getInstance("AES");
            keyGen.init(256);
            SecretKey dataKey = keyGen.generateKey();
            
            // 使用数据密钥加密数据
            Cipher dataCipher = Cipher.getInstance("AES");
            dataCipher.init(Cipher.ENCRYPT_MODE, dataKey);
            byte[] encryptedData = dataCipher.doFinal(data.getBytes());
            
            // 为每个属性加密数据密钥
            Map<String, String> encryptedKeys = new HashMap<>();
            for (String attribute : attributeSet) {
                SecretKey attributeKey = attributeKeys.get(attribute);
                if (attributeKey == null) {
                    throw new RuntimeException("未找到属性的密钥: " + attribute);
                }
                
                Cipher keyCipher = Cipher.getInstance("AES");
                keyCipher.init(Cipher.ENCRYPT_MODE, attributeKey);
                byte[] encryptedKey = keyCipher.doFinal(dataKey.getEncoded());
                encryptedKeys.put(attribute, Base64.getEncoder().encodeToString(encryptedKey));
            }
            
            // 构造结果：属性列表|加密密钥映射|加密数据
            StringBuilder result = new StringBuilder();
            result.append(String.join(",", attributes)).append("|");
            
            List<String> keyPairs = new ArrayList<>();
            for (Map.Entry<String, String> entry : encryptedKeys.entrySet()) {
                keyPairs.add(entry.getKey() + ":" + entry.getValue());
            }
            result.append(String.join(";", keyPairs)).append("|");
            result.append(Base64.getEncoder().encodeToString(encryptedData));
            
            return result.toString();
        } catch (Exception e) {
            throw new RuntimeException("加密失败: " + e.getMessage(), e);
        }
    }
    
    @Override
    public String decrypt(String encryptedData, String... userAttributes) throws Exception {
        try {
            // 解析加密数据结构
            String[] parts = encryptedData.split("\\|", 3);
            if (parts.length != 3) {
                throw new Exception("加密数据格式错误");
            }
            
            String[] attributes = parts[0].split(",");
            String[] keyPairs = parts[1].split(";");
            String actualEncryptedData = parts[2];
            
            // 将密钥对解析为映射
            Map<String, String> encryptedKeys = new HashMap<>();
            for (String keyPair : keyPairs) {
                String[] kv = keyPair.split(":", 2);
                if (kv.length == 2) {
                    encryptedKeys.put(kv[0], kv[1]);
                }
            }
            
            // 查找用户具有权限的属性
            String userAttribute = null;
            SecretKey userKey = null;
            
            for (String attr : userAttributes) {
                String upperAttr = attr.toUpperCase();
                if (encryptedKeys.containsKey(upperAttr) && attributeKeys.containsKey(upperAttr)) {
                    userAttribute = upperAttr;
                    userKey = attributeKeys.get(upperAttr);
                    break;
                }
            }
            
            if (userAttribute == null || userKey == null) {
                throw new Exception("用户没有解密此数据的权限");
            }
            
            // 使用用户密钥解密数据密钥
            String encryptedKeyBase64 = encryptedKeys.get(userAttribute);
            byte[] encryptedKeyBytes = Base64.getDecoder().decode(encryptedKeyBase64);
            
            Cipher keyCipher = Cipher.getInstance("AES");
            keyCipher.init(Cipher.DECRYPT_MODE, userKey);
            byte[] dataKeyBytes = keyCipher.doFinal(encryptedKeyBytes);
            SecretKey dataKey = new SecretKeySpec(dataKeyBytes, "AES");
            
            // 使用数据密钥解密实际数据
            byte[] encryptedDataBytes = Base64.getDecoder().decode(actualEncryptedData);
            Cipher dataCipher = Cipher.getInstance("AES");
            dataCipher.init(Cipher.DECRYPT_MODE, dataKey);
            byte[] decryptedData = dataCipher.doFinal(encryptedDataBytes);
            
            return new String(decryptedData);
        } catch (Exception e) {
            throw new Exception("解密失败: " + e.getMessage(), e);
        }
    }
    
    /**
     * 获取所有属性列表
     * @return 属性列表
     */
    public Set<String> getAttributes() {
        return new HashSet<>(attributeKeys.keySet());
    }
}