package com.autocrowd.backend.controller;

import com.autocrowd.backend.service.IbeService;
import com.autocrowd.backend.util.ResponseUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ibe")
public class IbeController {

    @Autowired
    private IbeService ibeService;

    /**
     * 获取IBE公钥
     * @return Base64编码的公钥
     */
    @GetMapping("/public-key")
    public ResponseEntity<Map<String, Object>> getPublicKey() {
        try {
            String publicKey = ibeService.getPublicKey();
            return ResponseEntity.ok(ResponseUtil.success(publicKey, "获取公钥成功"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ResponseUtil.error("获取公钥失败"));
        }
    }

    /**
     * 为用户生成私钥（仅第一次）
     * @param request 包含用户属性的请求体
     * @return 用户属性和Base64编码的私钥
     */
    @PostMapping("/private-key")
    public ResponseEntity<Map<String, Object>> generatePrivateKey(@RequestBody Map<String, String> request) {
        String attribute = request.get("attribute");
        if (attribute == null || attribute.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ResponseUtil.error(400, "attribute is required"));
        }
        try {
            Map<String, Object> result = ibeService.generatePrivateKey(attribute);
            return ResponseEntity.ok(ResponseUtil.success(result, "生成私钥成功"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ResponseUtil.error("生成私钥失败: " + e.getMessage()));
        }
    }

    /**
     * 检查用户是否有权限访问特定数据
     * @param request 包含访问策略和用户属性的请求体
     * @return 是否有访问权限
     */
    @PostMapping("/check-access")
    public ResponseEntity<Map<String, Object>> checkAccess(@RequestBody Map<String, String> request) {
        String accessPolicy = request.get("access_policy");
        String userAttribute = request.get("user_attribute");
        if (accessPolicy == null || userAttribute == null) {
            return ResponseEntity.badRequest().body(ResponseUtil.error(400, "access_policy and user_attribute are required"));
        }
        try {
            boolean hasAccess = ibeService.checkAccess(accessPolicy, userAttribute);
            return ResponseEntity.ok(ResponseUtil.success(hasAccess, "权限检查完成"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ResponseUtil.error("权限检查失败: " + e.getMessage()));
        }
    }
    
    /**
     * 测试加密功能 - 仅供内部测试使用
     * @param request 包含明文和用户属性的请求体
     * @return 加密后的数据
     */
    @PostMapping("/encrypt")
    public ResponseEntity<Map<String, Object>> encryptData(@RequestBody Map<String, String> request) {
        String plaintext = request.get("plaintext");
        String attribute = request.get("attribute");
        
        if (plaintext == null || attribute == null) {
            return ResponseEntity.badRequest().body(ResponseUtil.error(400, "plaintext and attribute are required"));
        }
        
        try {
            String ciphertext = ibeService.encrypt(plaintext, attribute);
            Map<String, String> result = Map.of(
                "plaintext", plaintext,
                "ciphertext", ciphertext,
                "attribute", attribute
            );
            return ResponseEntity.ok(ResponseUtil.success(result, "加密成功"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ResponseUtil.error("加密失败: " + e.getMessage()));
        }
    }
    
    /**
     * 测试解密功能 - 仅供内部测试使用
     * @param request 包含密文和用户属性的请求体
     * @return 解密后的数据
     */
    @PostMapping("/decrypt")
    public ResponseEntity<Map<String, Object>> decryptData(@RequestBody Map<String, String> request) {
        String ciphertext = request.get("ciphertext");
        String attribute = request.get("attribute");
        
        if (ciphertext == null || attribute == null) {
            return ResponseEntity.badRequest().body(ResponseUtil.error(400, "ciphertext and attribute are required"));
        }
        
        try {
            String plaintext = ibeService.decrypt(ciphertext, attribute);
            Map<String, String> result = Map.of(
                "ciphertext", ciphertext,
                "plaintext", plaintext,
                "attribute", attribute
            );
            return ResponseEntity.ok(ResponseUtil.success(result, "解密成功"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ResponseUtil.error("解密失败: " + e.getMessage()));
        }
    }
}