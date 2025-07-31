package com.autocrowd.backend.controller;

import com.autocrowd.backend.dto.CreateOrderRequest;
import com.autocrowd.backend.dto.CurrentOrderResponse;
import com.autocrowd.backend.dto.EstimatePriceRequest;
import com.autocrowd.backend.dto.AddReviewRequest;
import com.autocrowd.backend.dto.UserOrderDetailResponse;
import com.autocrowd.backend.entity.Order;
import com.autocrowd.backend.entity.Review;
import com.autocrowd.backend.exception.BusinessException;
import com.autocrowd.backend.exception.ExceptionCodeEnum;
import com.autocrowd.backend.service.OrderService;
import com.autocrowd.backend.util.JwtUtil;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AllArgsConstructor;
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

    private final OrderService orderService;
    private final JwtUtil jwtUtil;

    /**
     * 查询当前进行中的订单
     */
    @GetMapping("/current")
    public ResponseEntity<Map<String, Object>> getCurrentOrder() {
        System.out.println("[OrderController] 收到查询当前订单请求");
        try {
            // 只查询状态为'In progress'的订单
            List<CurrentOrderResponse> currentOrder = orderService.getAllCurrentOrder();
            Map<String, Object> result = new HashMap<>();
            result.put("data", currentOrder);
            System.out.println("[OrderController] 返回当前订单结果: " + currentOrder);
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

    /**
     * 更新订单状态
     */
    @PutMapping
    public ResponseEntity<Map<String, Object>> updateOrderStatus(
            @RequestParam String orderId,
            @RequestParam Byte status) {
        System.out.println("[OrderController] 收到更新订单状态请求: 订单ID=" + orderId + ", 状态=" + status);
        try {
            Order updatedOrder = orderService.updateOrderStatus(orderId, status);
            Map<String, Object> result = new HashMap<>();
            Map<String, Object> orderData = new HashMap<>();
            orderData.put("order_id", updatedOrder.getOrderId());
            orderData.put("status", status);
            result.put("data", orderData);
            System.out.println("[OrderController] 返回更新订单状态结果: " + updatedOrder);
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

    /**
     * 价格预估接口
     */
    @PostMapping("/estimate")
    public ResponseEntity<Map<String, Object>> estimatePrice(@RequestBody EstimatePriceRequest request) {
        System.out.println("[OrderController] 收到价格预估请求: " + request);
        try {
            Map<String, Object> result = new HashMap<>();
            Map<String, Object> estimateData = orderService.estimatePrice(request);
            result.put("data", estimateData);
            System.out.println("[OrderController] 返回价格预估结果: " + estimateData);
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

    /**
     * 创建订单接口
     */
    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> createOrder(@RequestBody CreateOrderRequest request, HttpServletRequest httpRequest) {
        System.out.println("[OrderController] 收到创建订单请求: " + request);
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
            Map<String, Object> orderData = new HashMap<>();
            orderData.put("order_id", order.getOrderId());
            orderData.put("estimated_price", order.getEstimatedPrice());
            // 使用实际的距离和时间占位符
            orderData.put("distance_km", "5.50公里"); // 占位符，实际应通过算法计算
            orderData.put("duration_min", "15分钟"); // 占位符，实际应通过算法计算
            result.put("data", orderData);
            System.out.println("[OrderController] 返回创建订单结果: " + order);
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
    
    /**
     * 更新订单状态从1到2（On the way -> In progress）
     * 此接口不需要JWT验证
     */
    @PostMapping("/start")
    public ResponseEntity<Map<String, Object>> startOrder(@RequestParam String orderId) {
        System.out.println("[OrderController] 收到开始订单请求: 订单ID=" + orderId);
        try {
            // 验证订单ID
            if (orderId == null || orderId.isEmpty()) {
                throw new BusinessException(ExceptionCodeEnum.PARAM_ERROR, "订单ID不能为空");
            }
            
            // 获取订单详情
            Order order = orderService.getOrderById(orderId);
            
            // 检查订单状态是否为1（On the way）
            if (order.getStatus() != 1) {
                throw new BusinessException(ExceptionCodeEnum.ORDER_STATUS_ERROR, "订单状态不正确，无法开始服务");
            }
            
            // 更新订单状态为2（In progress）
            Order updatedOrder = orderService.updateOrderStatus(orderId, (byte) 2);
            
            Map<String, Object> result = new HashMap<>();
            Map<String, Object> orderData = new HashMap<>();
            orderData.put("order_id", updatedOrder.getOrderId());
            orderData.put("status", updatedOrder.getStatus());
            result.put("data", orderData);
            System.out.println("[OrderController] 返回开始订单结果: " + updatedOrder);
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
    
    /**
     * 添加订单评价
     */
    @PostMapping("/review")
    public ResponseEntity<Map<String, Object>> addReview(@RequestBody AddReviewRequest request, HttpServletRequest httpRequest) {
        System.out.println("[OrderController] 收到添加订单评价请求: " + request);
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
            
            Review review = orderService.addReview(request, userId);
            
            Map<String, Object> result = new HashMap<>();
            Map<String, Object> reviewData = new HashMap<>();
            reviewData.put("review_id", review.getReviewId());
            reviewData.put("order_id", review.getOrderId());
            reviewData.put("content", review.getContent());
            reviewData.put("comment_star", review.getCommentStar());
            result.put("data", reviewData);
            System.out.println("[OrderController] 返回添加订单评价结果: " + review);
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