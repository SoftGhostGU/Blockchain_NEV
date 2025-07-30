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
     * 根据订单ID获取订单详情
     * @param orderId 订单ID
     * @return 订单详情
     */
    Order getOrderById(String orderId);

    /**
     * 更新订单状态
     * @param orderId 订单ID
     * @param status 新状态
     * @return 更新后的订单
     */
    Order updateOrderStatus(String orderId, byte status);

    /**
     * 司机接单
     * @param orderId 订单ID
     * @param driverId 司机ID
     * @param vehicleId 车辆ID
     * @return 接单结果
     */
    Order acceptOrder(String orderId, Integer driverId, Integer vehicleId);
    
    /**
     * 根据状态获取订单列表
     * @param status 订单状态
     * @return 订单列表
     */
    List<Order> getCurrentOrderByStatus(String status);

    /**
     * 结算订单
     * @param orderId 订单ID
     * @param actualPrice 实际价格
     * @return 结算后的订单
     */
    Order completeOrder(String orderId, BigDecimal actualPrice);
}