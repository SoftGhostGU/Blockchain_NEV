package com.autocrowd.backend.controller;

import com.autocrowd.backend.dto.user.*;
import com.autocrowd.backend.dto.order.UserOrderDetailResponse;
import com.autocrowd.backend.entity.User;
import com.autocrowd.backend.exception.BusinessException;
import com.autocrowd.backend.exception.ExceptionCodeEnum;
import com.autocrowd.backend.repository.UserRepository;
import com.autocrowd.backend.service.UserService;
import com.autocrowd.backend.service.OrderService;
import com.autocrowd.backend.util.JwtUtil;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 用户控制器
 * 处理用户注册、登录、资料查询和更新等用户相关的HTTP请求
 * 作为表示层，接收前端请求并调用服务层处理业务逻辑
 */
@RestController
@RequestMapping("/api/user")
@AllArgsConstructor
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    private final UserService userService;
    private final OrderService orderService;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    
    /**
     * 用户注册接口
     * 接收用户注册请求，验证用户信息，创建新用户并返回用户信息和JWT令牌
     * @param registerRequest 注册请求DTO，包含用户名、密码、邮箱等用户注册信息
     * @return 包含注册结果、用户信息和JWT令牌的响应实体
     */
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody RegisterRequest registerRequest) {
        logger.info("[Controller] 用户注册接口 - 接收到注册请求: {}", registerRequest);
        try {
            logger.debug("[Controller] 调用UserService.register()方法，处理用户注册业务逻辑");
            UserProfileDTO userResponse = userService.register(registerRequest);
            logger.debug("[Controller] UserService.register()返回结果: {}", userResponse);
            logger.debug("[Controller] 查询用户完整信息，用户ID: {}", userResponse.getUserId());
            User user = userRepository.findById(userResponse.getUserId()).orElseThrow();
            logger.debug("[Controller] 查询到的用户完整信息: {}", user);

            Map<String, Object> userData = new HashMap<>();
            userData.put("user_id", user.getUserId());
            userData.put("username", user.getUsername());
            userData.put("credit_score", user.getCreditScore());
            userData.put("balance", user.getBalance());

            Map<String, Object> response = new HashMap<>();
            response.put("code", 0);
            Map<String, Object> data = new HashMap<>();
            String token = jwtUtil.generateToken(user.getUserId().toString(), user.getUsername(), "USER");
            data.put("token", token);
            data.put("user", userData);
            response.put("data", data);

            logger.debug("[Controller] 用户注册接口 - 返回注册响应: {}", response);
        return ResponseEntity.ok(response);
        } catch (BusinessException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("code", e.getCode());
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.ok(errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("code", 500);
            errorResponse.put("message", "服务器内部错误");
            return ResponseEntity.ok(errorResponse);
        }
    }

    /**
     * 用户资料查询接口
     * 从请求头获取JWT令牌，解析用户ID，查询并返回用户详细资料
     * @param request HTTP请求对象，包含Authorization请求头
     * @return 包含用户资料的响应实体
     */
    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getUserProfile(HttpServletRequest request) {
        logger.debug("[Controller] 用户资料查询接口 - 接收到资料请求");
        try {
            // 从请求头获取token
            String token = request.getHeader("Authorization");
            logger.debug("[Controller] 获取到Authorization头: {}", (token != null ? "Bearer ****" : "null"));
            if (token == null || !token.startsWith("Bearer ")) {
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN);
            }
            token = token.substring(7);

            // 解析token获取用户ID
            logger.debug("[Controller] 开始解析token");
            Claims claims = jwtUtil.parseToken(token);
            logger.debug("[Controller] token解析成功，claims内容: {}", claims);
            String userIdStr = claims.get("userId", String.class);
            String username = claims.get("username", String.class);
            String role = claims.get("role", String.class);
            logger.debug("[Controller] 从token中解析到用户信息 - userId: {}, username: {}, role: {}", userIdStr, username, role);
            if (userIdStr == null || userIdStr.isEmpty()) {
                logger.warn("[Controller] token解析失败: 用户ID为空");
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN, "token中未包含用户ID");
            }
            Integer userId;
            try {
                userId = Integer.valueOf(userIdStr);
                System.out.println("[Controller] 用户ID字符串转换为整数成功: " + userId);
            } catch (NumberFormatException e) {
                logger.warn("[Controller] 用户ID格式错误，无法转换为整数: {}", userIdStr);
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN, "用户ID格式错误");
            }

            // 获取用户资料
            logger.debug("[Controller] 开始查询用户资料，用户ID: {}", userId);
            logger.debug("[Controller] 调用UserService.getUserProfile()方法，查询用户资料，用户ID: {}", userId);
            UserProfileDTO profile = userService.getUserProfile(userId);
            logger.debug("[Controller] UserService.getUserProfile()返回结果: {}", profile);
            if (profile == null) {
                System.out.println("[Controller] 用户资料不存在，用户ID: " + userId);
                throw new BusinessException(ExceptionCodeEnum.USER_NOT_FOUND);
            }
            logger.debug("[Controller] 查询到用户资料: {}", profile);

            Map<String, Object> response = new HashMap<>();
            response.put("code", 0);
            response.put("data", profile);
            logger.debug("[Controller] 用户资料查询接口 - 返回用户资料响应: {}", response);
            return ResponseEntity.ok(response);
        } catch (BusinessException e) {
            logger.warn("[Controller] 业务异常: {}, {}", e.getCode(), e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("code", e.getCode());
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.ok(errorResponse);
        } catch (Exception e) {
            logger.error("[Controller] 服务器内部错误: {}, 消息: {}", e.getClass().getName(), e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("code", 500);
            errorResponse.put("message", "服务器内部错误: " + e.getMessage());
            return ResponseEntity.ok(errorResponse);
        }
    }

    /**
     * 用户资料更新接口
     * 从请求头获取JWT令牌，解析用户ID，更新用户资料并返回更新后的用户信息
     * @param request HTTP请求对象，包含Authorization请求头
     * @param profileUpdateRequest 资料更新请求DTO，包含需要更新的用户信息
     * @return 包含更新后用户资料的响应实体
     */
    @PutMapping("/profile")
    public ResponseEntity<Map<String, Object>> updateUserProfile(HttpServletRequest request, @RequestBody UserProfileUpdateRequest profileUpdateRequest) {
        logger.debug("[Controller] 用户资料更新接口 - 接收到更新请求: {}", profileUpdateRequest);
        try {
            // 从请求头获取token
            String token = request.getHeader("Authorization");
            if (token == null || !token.startsWith("Bearer ")) {
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN);
            }
            token = token.substring(7);

            // 解析token获取用户ID
            Claims claims = jwtUtil.parseToken(token);
            logger.debug("[Controller] token解析成功，claims内容: {}", claims);
            String userIdStr = claims.get("userId", String.class);
            String username = claims.get("username", String.class);
            String role = claims.get("role", String.class);
            logger.debug("[Controller] 从token中解析到用户信息 - userId: {}, username: {}, role: {}", userIdStr, username, role);
            if (userIdStr == null || userIdStr.isEmpty()) {
                logger.warn("[Controller] token解析失败: 用户ID为空");
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN, "token中未包含用户ID");
            }
            Integer userId = Integer.valueOf(userIdStr);

            // 更新用户资料
            logger.debug("[Controller] 调用UserService.updateUserProfile()方法，更新用户资料，用户ID: {}, 更新内容: {}", userId, profileUpdateRequest);
            UserProfileDTO updatedProfile = userService.updateUserProfile(userId, profileUpdateRequest);
            logger.debug("[Controller] UserService.updateUserProfile()返回结果: {}", updatedProfile);
            System.out.println("[Controller] 用户资料更新接口 - 返回更新响应: " + updatedProfile);

            Map<String, Object> response = new HashMap<>();
            response.put("code", 0);
            response.put("data", updatedProfile);
            return ResponseEntity.ok(response);
        } catch (BusinessException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("code", e.getCode());
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.ok(errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("code", 500);
            errorResponse.put("message", "服务器内部错误");
            return ResponseEntity.ok(errorResponse);
        }
    }

    /**
     * 用户登录接口
     * 接收用户登录请求，验证用户名和密码，生成JWT令牌并返回用户信息
     * @param loginRequest 登录请求DTO，包含用户名和密码
     * @return 包含登录结果、用户信息和JWT令牌的响应实体
     */
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequest loginRequest) {
        logger.info("[Controller] 用户登录接口 - 接收到登录请求: {}", loginRequest);
        try {
            logger.debug("[Controller] 调用UserService.login()方法，处理用户登录业务逻辑");
            UserProfileDTO userResponse = userService.login(loginRequest);
            logger.debug("[Controller] UserService.login()返回结果: {}", userResponse);
            logger.debug("[Controller] 查询用户完整信息，用户ID: {}", userResponse.getUserId());
            User user = userRepository.findById(userResponse.getUserId()).orElseThrow();
            logger.debug("[Controller] 查询到的用户完整信息: {}", user);

            Map<String, Object> userData = new HashMap<>();
            userData.put("user_id", user.getUserId());
            userData.put("username", user.getUsername());
            userData.put("credit_score", user.getCreditScore());
            userData.put("balance", user.getBalance());

            Map<String, Object> data = new HashMap<>();
            String token = jwtUtil.generateToken(user.getUserId().toString(), user.getUsername(), "USER");
            data.put("token", token);
            data.put("user", userData);

            Map<String, Object> response = new HashMap<>();
            response.put("code", 0);
            response.put("data", data);
            logger.debug("[Controller] 用户登录接口 - 返回登录响应: {}", response);
        return ResponseEntity.ok(response);
        } catch (BusinessException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("code", e.getCode());
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.ok(errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("code", 500);
            errorResponse.put("message", "服务器内部错误");
            return ResponseEntity.ok(errorResponse);
        }
    }

    /**
     * 查询用户历史订单（已完成的订单）
     */
    @GetMapping("/orders/history")
    public ResponseEntity<Map<String, Object>> getUserOrderHistory(HttpServletRequest httpRequest) {
        logger.debug("[UserController] 收到查询用户历史订单请求");
        try {
            // 从Authorization头获取token并解析用户ID
            String authHeader = httpRequest.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN);
            }
            String token = authHeader.substring(7);
            Claims claims = jwtUtil.parseToken(token);
            // 获取userId
            String userId = claims.get("userId", String.class);

            if (userId == null) {
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN);
            }
            
            List<UserOrderDetailResponse> historyOrders = orderService.getUserHistoryOrders(Integer.valueOf(userId));
            
            Map<String, Object> result = new HashMap<>();
            result.put("data", historyOrders);
            logger.debug("[UserController] 返回用户历史订单结果: {} 条记录", historyOrders.size());
            return ResponseEntity.ok(result);
        } catch (BusinessException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("code", e.getCode());
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.ok(errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("code", 500);
            errorResponse.put("message", "服务器内部错误");
            return ResponseEntity.ok(errorResponse);
        }
    }
}