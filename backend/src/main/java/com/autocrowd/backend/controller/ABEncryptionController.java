package com.autocrowd.backend.controller;

import com.autocrowd.backend.service.ABEncryptionService;
import com.autocrowd.backend.service.impl.ABEncryptionServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/encryption")
public class ABEncryptionController {
    
    @Autowired
    private ABEncryptionService abEncryptionService;
    
    // 注入具体实现以访问额外方法
    @Autowired
    private ABEncryptionServiceImpl abEncryptionServiceImpl;
    
    /**
     * 加密接口
     * @param request 包含待加密数据和访问属性的请求体
     * @return 加密结果
     */
    @PostMapping("/encrypt")
    public ResponseEntity<Map<String, Object>> encrypt(@RequestBody EncryptRequest request) {
        try {
            String encryptedData = abEncryptionService.encrypt(request.getData(), request.getAttributes());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("encryptedData", encryptedData);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "加密失败: " + e.getMessage());
            
            return ResponseEntity.status(500).body(response);
        }
    }
    
    /**
     * 解密接口
     * @param request 包含加密数据和用户属性的请求体
     * @return 解密结果
     */
    @PostMapping("/decrypt")
    public ResponseEntity<Map<String, Object>> decrypt(@RequestBody DecryptRequest request) {
        try {
            String decryptedData = abEncryptionService.decrypt(request.getEncryptedData(), request.getUserAttributes());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("decryptedData", decryptedData);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "解密失败: " + e.getMessage());
            
            return ResponseEntity.status(500).body(response);
        }
    }
    
    /**
     * 生成属性密钥
     * @param attribute 属性名称
     * @return 生成的密钥
     */
    @PostMapping("/keys/generate")
    public ResponseEntity<Map<String, Object>> generateKey(@RequestParam String attribute) {
        try {
            String key = abEncryptionServiceImpl.generateAttributeKey(attribute);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("attribute", attribute);
            response.put("key", key);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "生成密钥失败: " + e.getMessage());
            
            return ResponseEntity.status(500).body(response);
        }
    }
    
    /**
     * 导入属性密钥
     * @param request 导入密钥请求
     * @return 操作结果
     */
    @PostMapping("/keys/import")
    public ResponseEntity<Map<String, Object>> importKey(@RequestBody ImportKeyRequest request) {
        try {
            abEncryptionServiceImpl.importAttributeKey(request.getAttribute(), request.getKey());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "密钥导入成功");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "导入密钥失败: " + e.getMessage());
            
            return ResponseEntity.status(500).body(response);
        }
    }
    
    /**
     * 获取属性密钥
     * @param attribute 属性名称
     * @return 密钥
     */
    @GetMapping("/keys/{attribute}")
    public ResponseEntity<Map<String, Object>> getKey(@PathVariable String attribute) {
        try {
            String key = abEncryptionServiceImpl.getAttributeKey(attribute);
            
            if (key == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("error", "未找到属性的密钥: " + attribute);
                return ResponseEntity.status(404).body(response);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("attribute", attribute);
            response.put("key", key);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "获取密钥失败: " + e.getMessage());
            
            return ResponseEntity.status(500).body(response);
        }
    }
    
    /**
     * 获取所有属性列表
     * @return 属性列表
     */
    @GetMapping("/attributes")
    public ResponseEntity<Map<String, Object>> getAttributes() {
        try {
            Set<String> attributes = abEncryptionServiceImpl.getAttributes();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("attributes", attributes);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "获取属性列表失败: " + e.getMessage());
            
            return ResponseEntity.status(500).body(response);
        }
    }
    
    /**
     * 加密请求数据结构
     */
    public static class EncryptRequest {
        private String data;
        private String[] attributes;
        
        // Getters and setters
        public String getData() {
            return data;
        }
        
        public void setData(String data) {
            this.data = data;
        }
        
        public String[] getAttributes() {
            return attributes;
        }
        
        public void setAttributes(String[] attributes) {
            this.attributes = attributes;
        }
    }
    
    /**
     * 解密请求数据结构
     */
    public static class DecryptRequest {
        private String encryptedData;
        private String[] userAttributes;
        
        // Getters and setters
        public String getEncryptedData() {
            return encryptedData;
        }
        
        public void setEncryptedData(String encryptedData) {
            this.encryptedData = encryptedData;
        }
        
        public String[] getUserAttributes() {
            return userAttributes;
        }
        
        public void setUserAttributes(String[] userAttributes) {
            this.userAttributes = userAttributes;
        }
    }
    
    /**
     * 导入密钥请求数据结构
     */
    public static class ImportKeyRequest {
        private String attribute;
        private String key;
        
        // Getters and setters
        public String getAttribute() {
            return attribute;
        }
        
        public void setAttribute(String attribute) {
            this.attribute = attribute;
        }
        
        public String getKey() {
            return key;
        }
        
        public void setKey(String key) {
            this.key = key;
        }
    }
}