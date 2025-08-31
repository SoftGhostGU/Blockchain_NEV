package com.autocrowd.backend.controller;

import com.autocrowd.backend.entity.Order;
import com.autocrowd.backend.service.IbeService;
import com.autocrowd.backend.service.OrderService;
import com.autocrowd.backend.util.JwtUtil;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/order-encryption")
public class OrderEncryptionController {

    private static final Logger logger = LoggerFactory.getLogger(OrderEncryptionController.class);

    @Autowired
    private OrderService orderService;
    
    @Autowired
    private IbeService ibeService;

    @Autowired
    private JwtUtil jwtUtil;

    /**
     * 获取订单的加密数据和访问策略供前端解密
     * @param orderId 订单ID
     * @param httpRequest HTTP请求对象，用于获取token信息
     * @return 订单的加密数据和访问策略
     */
    @GetMapping("/order/{orderId}")
    public ResponseEntity<Map<String, Object>> getOrderEncryptedData(@PathVariable String orderId,
                                                                     HttpServletRequest httpRequest) {
        logger.info("开始获取订单加密数据，订单ID: {}", orderId);

        try {
            // 获取订单详情
            Order order = orderService.getOrderById(orderId);
            
            // 从JWT token中获取用户信息
            String userRole = getUserRoleFromToken(httpRequest);
            Long userId = getUserIdFromToken(httpRequest);
            
            if (userRole == null || userId == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("code", 401);
                response.put("data", null);
                response.put("message", "用户未授权");
                return ResponseEntity.status(401).body(response);
            }
            
            // 构造用户属性
            String userAttribute = userRole.toUpperCase() + "_" + userId;
            
            // 检查用户是否有权限访问该订单数据
            if (!ibeService.checkAccess(order.getAccessPolicy(), userAttribute)) {
                Map<String, Object> response = new HashMap<>();
                response.put("code", 403);
                response.put("data", null);
                response.put("message", "用户无需要的解密权限");
                return ResponseEntity.status(403).body(response);
            }

            // 构造响应数据
            Map<String, Object> data = new HashMap<>();
            data.put("orderId", order.getOrderId());
            data.put("startLocation", order.getStartLocation());
            data.put("destination", order.getDestination());
            data.put("estimatedPrice", order.getEstimatedPrice());
            data.put("actualPrice", order.getActualPrice());
            data.put("accessPolicy", order.getAccessPolicy());

            Map<String, Object> response = new HashMap<>();
            response.put("code", 0);
            response.put("data", data);
            response.put("message", "获取订单加密数据成功");

            logger.info("成功获取订单加密数据，订单ID: {}", orderId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("获取订单加密数据时发生错误: {}", e.getMessage(), e);

            Map<String, Object> response = new HashMap<>();
            response.put("code", 500);
            response.put("data", null);
            response.put("message", "获取订单加密数据失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * 从JWT token中获取用户ID
     * @param request HTTP请求对象
     * @return 用户ID
     */
    private Long getUserIdFromToken(HttpServletRequest request) {
        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
            try {
                Claims claims = jwtUtil.parseToken(token);
                return Long.valueOf(claims.getSubject());
            } catch (Exception e) {
                // Token解析失败
                logger.error("Token解析失败: {}", e.getMessage());
                return null;
            }
        }
        return null;
    }

    /**
     * 从JWT token中获取用户角色
     * @param request HTTP请求对象
     * @return 用户角色
     */
    private String getUserRoleFromToken(HttpServletRequest request) {
        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
            try {
                Claims claims = jwtUtil.parseToken(token);
                return (String) claims.get("role");
            } catch (Exception e) {
                // Token解析失败
                logger.error("Token解析失败: {}", e.getMessage());
                return null;
            }
        }
        return null;
    }

}