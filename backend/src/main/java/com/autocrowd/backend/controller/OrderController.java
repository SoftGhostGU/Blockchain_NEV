package com.autocrowd.backend.controller;

import com.autocrowd.backend.dto.order.*;
import com.autocrowd.backend.entity.Order;
import com.autocrowd.backend.entity.Review;
import com.autocrowd.backend.exception.BusinessException;
import com.autocrowd.backend.exception.ExceptionCodeEnum;
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
 * 订单控制器，处理订单相关请求
 */
@RestController
@RequestMapping("/api/order")
@AllArgsConstructor
public class OrderController {

    private static final Logger logger = LoggerFactory.getLogger(OrderController.class);

    private final OrderService orderService;
    private final JwtUtil jwtUtil;

    /**
     * 查询当前进行中的订单
     */
    @GetMapping("/current")
    public ResponseEntity<Map<String, Object>> getCurrentOrder(HttpServletRequest httpRequest) {
        logger.debug("[OrderController] 收到查询当前订单请求");
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
            
            // 获取用户当前订单
            CurrentOrderResponse currentOrder = orderService.getCurrentOrderByUserId(Integer.valueOf(userId));
            Map<String, Object> result = new HashMap<>();
            result.put("data", currentOrder != null ? currentOrder : new HashMap<>());
            logger.debug("[OrderController] 返回当前订单结果: {}", currentOrder);
            return ResponseEntity.ok(result);
        } catch (BusinessException e) {
            logger.warn("[OrderController] 业务异常: code={}, message={}", e.getCode(), e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("code", e.getCode());
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.ok(errorResponse);
        } catch (Exception e) {
            logger.error("[OrderController] 服务器内部错误", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("code", 500);
            errorResponse.put("message", "服务器内部错误");
            return ResponseEntity.ok(errorResponse);
        }
    }

    /**
     * 更新订单状态
     */
    @PutMapping
    public ResponseEntity<Map<String, Object>> updateOrderStatus(
            @RequestParam String orderId,
            @RequestParam Byte status) {
        logger.debug("[OrderController] 收到更新订单状态请求: 订单ID={}, 状态={}", orderId, status);
        try {
            Order updatedOrder = orderService.updateOrderStatus(orderId, status);
            Map<String, Object> result = new HashMap<>();
            result.put("data", Map.of(
                "order_id", updatedOrder.getOrderId(),
                "status", status
            ));
            logger.debug("[OrderController] 返回更新订单状态结果: {}", updatedOrder);
            return ResponseEntity.ok(result);
        } catch (BusinessException e) {
            logger.warn("[OrderController] 业务异常: code={}, message={}", e.getCode(), e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("code", e.getCode());
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.ok(errorResponse);
        } catch (Exception e) {
            logger.error("[OrderController] 服务器内部错误", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("code", 500);
            errorResponse.put("message", "服务器内部错误");
            return ResponseEntity.ok(errorResponse);
        }
    }

    /**
     * 价格预估接口
     */
    @PostMapping("/estimate")
    public ResponseEntity<Map<String, Object>> estimatePrice(@RequestBody EstimatePriceRequest request) {
        logger.debug("[OrderController] 收到价格预估请求: {}", request);
        try {
            Map<String, Object> result = new HashMap<>();
            Map<String, Object> estimateData = orderService.estimatePrice(request);
            result.put("data", estimateData);
            logger.debug("[OrderController] 返回价格预估结果: {}", estimateData);
            return ResponseEntity.ok(result);
        } catch (BusinessException e) {
            logger.warn("[OrderController] 业务异常: code={}, message={}", e.getCode(), e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("code", e.getCode());
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.ok(errorResponse);
        } catch (Exception e) {
            logger.error("[OrderController] 服务器内部错误", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("code", 500);
            errorResponse.put("message", "服务器内部错误");
            return ResponseEntity.ok(errorResponse);
        }
    }

    /**
     * 创建订单接口
     */
    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> createOrder(@RequestBody CreateOrderRequest request, HttpServletRequest httpRequest) {
        logger.debug("[OrderController] 收到创建订单请求: {}", request);
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
            
            Map<String, Object> result = new HashMap<>();
            Order order = orderService.createOrder(request, userId);
            result.put("data", Map.of(
                "order_id", order.getOrderId(),
                "estimated_price", order.getEstimatedPrice(),
                "distance_km", "5.50公里",
                "duration_min", "15分钟"
            ));
            logger.debug("[OrderController] 返回创建订单结果: {}", order);
            return ResponseEntity.ok(result);
        } catch (BusinessException e) {
            logger.warn("[OrderController] 业务异常: code={}, message={}", e.getCode(), e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("code", e.getCode());
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.ok(errorResponse);
        } catch (Exception e) {
            logger.error("[OrderController] 服务器内部错误", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("code", 500);
            errorResponse.put("message", "服务器内部错误");
            return ResponseEntity.ok(errorResponse);
        }
    }
    
    /**
     * 更新订单状态从1到2（On the way -> In progress）
     * 此接口不需要JWT验证
     */
    @PostMapping("/start")
    public ResponseEntity<Map<String, Object>> startOrder(@RequestParam String orderId) {
        logger.debug("[OrderController] 收到开始订单请求: 订单ID={}", orderId);
        try {
            // 验证订单ID
            if (orderId == null || orderId.isEmpty()) {
                throw new BusinessException(ExceptionCodeEnum.PARAM_ERROR, "订单ID不能为空");
            }
            
            // 获取订单详情并验证状态
            Order order = orderService.getOrderById(orderId);
            
            // 检查订单状态是否为1（On the way）
            if (order.getStatus() != 1) {
                throw new BusinessException(ExceptionCodeEnum.ORDER_STATUS_ERROR, "订单状态不正确，无法开始服务");
            }
            
            // 更新订单状态为2（In progress）
            Order updatedOrder = orderService.updateOrderStatus(orderId, (byte) 2);
            
            Map<String, Object> result = new HashMap<>();
            result.put("data", Map.of(
                "order_id", updatedOrder.getOrderId(),
                "status", updatedOrder.getStatus()
            ));
            logger.debug("[OrderController] 返回开始订单结果: {}", updatedOrder);
            return ResponseEntity.ok(result);
        } catch (BusinessException e) {
            logger.warn("[OrderController] 业务异常: code={}, message={}", e.getCode(), e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("code", e.getCode());
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.ok(errorResponse);
        } catch (Exception e) {
            logger.error("[OrderController] 服务器内部错误", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("code", 500);
            errorResponse.put("message", "服务器内部错误");
            return ResponseEntity.ok(errorResponse);
        }
    }
    
    /**
     * 添加订单评价
     */
    @PostMapping("/review")
    public ResponseEntity<Map<String, Object>> addReview(@RequestBody AddReviewRequest request, HttpServletRequest httpRequest) {
        logger.debug("[OrderController] 收到添加订单评价请求: {}", request);
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
            
            Review review = orderService.addReview(request, Integer.parseInt(userId));
            
            Map<String, Object> result = new HashMap<>();
            result.put("data", Map.of(
                "review_id", review.getReviewId(),
                "order_id", review.getOrderId(),
                "content", review.getContent(),
                "comment_star", review.getCommentStar()
            ));
            logger.debug("[OrderController] 返回添加订单评价结果: {}", review);
            return ResponseEntity.ok(result);
        } catch (BusinessException e) {
            logger.warn("[OrderController] 业务异常: code={}, message={}", e.getCode(), e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("code", e.getCode());
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.ok(errorResponse);
        } catch (Exception e) {
            logger.error("[OrderController] 服务器内部错误", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("code", 500);
            errorResponse.put("message", "服务器内部错误");
            return ResponseEntity.ok(errorResponse);
        }
    }
    
}