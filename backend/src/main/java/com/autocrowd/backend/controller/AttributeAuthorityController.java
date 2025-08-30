package com.autocrowd.backend.controller;

import com.autocrowd.backend.entity.AttributeAuthority;
import com.autocrowd.backend.service.AttributeAuthorityService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attribute-authority")
public class AttributeAuthorityController {

    private static final Logger logger = LoggerFactory.getLogger(AttributeAuthorityController.class);

    @Autowired
    private AttributeAuthorityService attributeAuthorityService;

    /**
     * 初始化属性权威机构
     * @param request 初始化请求
     * @return 权威机构信息
     */
    @PostMapping("/initialize")
    public ResponseEntity<Map<String, Object>> initializeAuthority(@RequestBody InitializeAuthorityRequest request) {
        try {
            logger.info("开始初始化属性权威机构: {}", request.getAuthorityName());

            AttributeAuthority authority = attributeAuthorityService.initializeAuthority(request.getAuthorityName());

            Map<String, Object> data = new HashMap<>();
            data.put("authorityId", authority.getId());
            data.put("authorityName", authority.getAuthorityName());
            data.put("publicKey", authority.getPublicKey());
            data.put("createdAt", authority.getCreatedAt());

            Map<String, Object> response = new HashMap<>();
            response.put("code", 0);
            response.put("data", data);
            response.put("message", "属性权威机构初始化成功");

            logger.info("属性权威机构初始化成功: {}", request.getAuthorityName());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("初始化属性权威机构时发生错误: {}", e.getMessage(), e);

            Map<String, Object> response = new HashMap<>();
            response.put("code", 500);
            response.put("data", null);
            response.put("message", "初始化属性权威机构失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * 获取属性权威机构公钥
     * @param authorityName 权威机构名称
     * @return 公钥信息
     */
    @GetMapping("/public-key/{authorityName}")
    public ResponseEntity<Map<String, Object>> getPublicKey(@PathVariable String authorityName) {
        try {
            logger.info("获取属性权威机构公钥: {}", authorityName);

            String publicKey = attributeAuthorityService.getPublicKey(authorityName);

            Map<String, Object> data = new HashMap<>();
            data.put("authorityName", authorityName);
            data.put("publicKey", publicKey);

            Map<String, Object> response = new HashMap<>();
            response.put("code", 0);
            response.put("data", data);
            response.put("message", "获取公钥成功");

            logger.info("获取公钥成功: {}", authorityName);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("获取公钥时发生错误: {}", e.getMessage(), e);

            Map<String, Object> response = new HashMap<>();
            response.put("code", 500);
            response.put("data", null);
            response.put("message", "获取公钥失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * 为属性生成密钥
     * @param request 生成密钥请求
     * @return 生成的密钥列表
     */
    @PostMapping("/generate-keys")
    public ResponseEntity<Map<String, Object>> generateAttributeKeys(@RequestBody GenerateKeysRequest request) {
        try {
            logger.info("为属性生成密钥，权威机构: {}, 属性数量: {}", 
                request.getAuthorityName(), request.getAttributes().size());

            List<String> keys = attributeAuthorityService.generateAttributeKeys(
                request.getAuthorityName(), 
                request.getAttributes()
            );

            Map<String, Object> data = new HashMap<>();
            data.put("authorityName", request.getAuthorityName());
            data.put("attributes", request.getAttributes());
            data.put("keys", keys);

            Map<String, Object> response = new HashMap<>();
            response.put("code", 0);
            response.put("data", data);
            response.put("message", "生成属性密钥成功");

            logger.info("生成属性密钥成功，权威机构: {}", request.getAuthorityName());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("生成属性密钥时发生错误: {}", e.getMessage(), e);

            Map<String, Object> response = new HashMap<>();
            response.put("code", 500);
            response.put("data", null);
            response.put("message", "生成属性密钥失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * 为用户生成属性密钥
     * @param request 生成用户属性密钥请求
     * @return 生成的密钥列表
     */
    @PostMapping("/generate-user-keys")
    public ResponseEntity<Map<String, Object>> generateUserAttributeKeys(@RequestBody GenerateUserKeysRequest request) {
        try {
            logger.info("为用户生成属性密钥，权威机构: {}, 用户ID: {}, 属性数量: {}", 
                request.getAuthorityName(), request.getUserId(), request.getAttributes().size());

            List<String> keys = attributeAuthorityService.generateUserAttributeKeys(
                request.getAuthorityName(), 
                request.getUserId(),
                request.getAttributes()
            );

            Map<String, Object> data = new HashMap<>();
            data.put("authorityName", request.getAuthorityName());
            data.put("userId", request.getUserId());
            data.put("attributes", request.getAttributes());
            data.put("keys", keys);

            Map<String, Object> response = new HashMap<>();
            response.put("code", 0);
            response.put("data", data);
            response.put("message", "生成用户属性密钥成功");

            logger.info("生成用户属性密钥成功，权威机构: {}, 用户ID: {}", 
                request.getAuthorityName(), request.getUserId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("生成用户属性密钥时发生错误: {}", e.getMessage(), e);

            Map<String, Object> response = new HashMap<>();
            response.put("code", 500);
            response.put("data", null);
            response.put("message", "生成用户属性密钥失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * 为车主生成属性密钥
     * @param request 生成车主属性密钥请求
     * @return 生成的密钥列表
     */
    @PostMapping("/generate-driver-keys")
    public ResponseEntity<Map<String, Object>> generateDriverAttributeKeys(@RequestBody GenerateDriverKeysRequest request) {
        try {
            logger.info("为车主生成属性密钥，权威机构: {}, 车主ID: {}, 属性数量: {}", 
                request.getAuthorityName(), request.getDriverId(), request.getAttributes().size());

            List<String> keys = attributeAuthorityService.generateDriverAttributeKeys(
                request.getAuthorityName(), 
                request.getDriverId(),
                request.getAttributes()
            );

            Map<String, Object> data = new HashMap<>();
            data.put("authorityName", request.getAuthorityName());
            data.put("driverId", request.getDriverId());
            data.put("attributes", request.getAttributes());
            data.put("keys", keys);

            Map<String, Object> response = new HashMap<>();
            response.put("code", 0);
            response.put("data", data);
            response.put("message", "生成车主属性密钥成功");

            logger.info("生成车主属性密钥成功，权威机构: {}, 车主ID: {}", 
                request.getAuthorityName(), request.getDriverId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("生成车主属性密钥时发生错误: {}", e.getMessage(), e);

            Map<String, Object> response = new HashMap<>();
            response.put("code", 500);
            response.put("data", null);
            response.put("message", "生成车主属性密钥失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // 请求体类
    public static class InitializeAuthorityRequest {
        private String authorityName;

        public String getAuthorityName() {
            return authorityName;
        }

        public void setAuthorityName(String authorityName) {
            this.authorityName = authorityName;
        }
    }

    public static class GenerateKeysRequest {
        private String authorityName;
        private List<String> attributes;

        public String getAuthorityName() {
            return authorityName;
        }

        public void setAuthorityName(String authorityName) {
            this.authorityName = authorityName;
        }

        public List<String> getAttributes() {
            return attributes;
        }

        public void setAttributes(List<String> attributes) {
            this.attributes = attributes;
        }
    }

    public static class GenerateUserKeysRequest {
        private String authorityName;
        private Long userId;
        private List<String> attributes;

        public String getAuthorityName() {
            return authorityName;
        }

        public void setAuthorityName(String authorityName) {
            this.authorityName = authorityName;
        }

        public Long getUserId() {
            return userId;
        }

        public void setUserId(Long userId) {
            this.userId = userId;
        }

        public List<String> getAttributes() {
            return attributes;
        }

        public void setAttributes(List<String> attributes) {
            this.attributes = attributes;
        }
    }

    public static class GenerateDriverKeysRequest {
        private String authorityName;
        private Long driverId;
        private List<String> attributes;

        public String getAuthorityName() {
            return authorityName;
        }

        public void setAuthorityName(String authorityName) {
            this.authorityName = authorityName;
        }

        public Long getDriverId() {
            return driverId;
        }

        public void setDriverId(Long driverId) {
            this.driverId = driverId;
        }

        public List<String> getAttributes() {
            return attributes;
        }

        public void setAttributes(List<String> attributes) {
            this.attributes = attributes;
        }
    }
}