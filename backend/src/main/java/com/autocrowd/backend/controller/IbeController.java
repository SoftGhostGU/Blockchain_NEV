package com.autocrowd.backend.controller;

import com.autocrowd.backend.service.IbeService;
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
    public ResponseEntity<String> getPublicKey() {
        String publicKey = ibeService.getPublicKey();
        return ResponseEntity.ok(publicKey);
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
            return ResponseEntity.badRequest().body(Map.of("error", "attribute is required"));
        }
        try {
            Map<String, Object> result = ibeService.generatePrivateKey(attribute);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to generate private key"));
        }
    }

    /**
     * 检查用户是否有权限访问特定数据
     * @param request 包含访问策略和用户属性的请求体
     * @return 是否有访问权限
     */
    @PostMapping("/check-access")
    public ResponseEntity<Boolean> checkAccess(@RequestBody Map<String, String> request) {
        String accessPolicy = request.get("access_policy");
        String userAttribute = request.get("user_attribute");
        if (accessPolicy == null || userAttribute == null) {
            return ResponseEntity.badRequest().body(false);
        }
        boolean hasAccess = ibeService.checkAccess(accessPolicy, userAttribute);
        return ResponseEntity.ok(hasAccess);
    }
}