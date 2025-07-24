package com.autocrowd.backend.controller;

import com.autocrowd.backend.dto.CreateOrderRequest;
import com.autocrowd.backend.entity.Order;
import com.autocrowd.backend.exception.BusinessException;
import com.autocrowd.backend.service.OrderService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * 订单控制器，处理订单相关请求
 */
@RestController
@RequestMapping("/api/order")
@AllArgsConstructor
public class OrderController {

    private final OrderService orderService;

    /**
     * 创建订单接口
     */
    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> createOrder(@RequestBody CreateOrderRequest request) {
        System.out.println("[OrderController] 收到创建订单请求: " + request);
        try {
            Map<String, Object> result = new HashMap<>();
            Order order = orderService.createOrder(request);
            Map<String, Object> orderData = new HashMap<>();
            orderData.put("order_id", order.getOrderId());
            orderData.put("estimated_price", "PLACEHOLDER_PRICE");
            orderData.put("distance_km", "PLACEHOLDER_DISTANCE");
            orderData.put("duration_min", "PLACEHOLDER_DURATION");
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
}