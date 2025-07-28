package com.autocrowd.backend.service;

import com.autocrowd.backend.dto.CreateOrderRequest;
import com.autocrowd.backend.entity.Order;
import java.math.BigDecimal;

import com.autocrowd.backend.entity.Order;

import com.autocrowd.backend.dto.EstimatePriceRequest;
import com.autocrowd.backend.dto.CurrentOrderResponse;

import java.util.List;
import java.util.Map;

public interface OrderService {
    Order createOrder(CreateOrderRequest request, String userId);

    /**
     * 价格预估
     * @param request 预估请求参数
     * @return 预估结果包含价格、距离和时间
     */
    Map<String, Object> estimatePrice(EstimatePriceRequest request);

    /**
     * 获取所有当前进行中的订单
     * @return 进行中的订单信息列表
     */
    List<CurrentOrderResponse> getAllCurrentOrder();

    /**
     * 按状态获取当前订单
     * @param status 订单状态
     * @return 指定状态的订单信息
     */
    List<Order> getCurrentOrderByStatus(String status);

    /**
     * 车主接单
     * @param orderId 订单ID
     * @param driverId 车主ID
     * @return 更新后的订单
     */
    Order acceptOrder(Integer orderId, String driverId, Integer vehicleId);

    /**
     * 更新订单状态
     * @param orderId 订单ID
     * @param status 新订单状态
     * @return 更新后的订单
     */
    Order updateOrderStatus(Integer orderId, String status);
}