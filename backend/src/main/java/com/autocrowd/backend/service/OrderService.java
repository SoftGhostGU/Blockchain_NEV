package com.autocrowd.backend.service;

import com.autocrowd.backend.dto.driver.DriverOrderDetailResponse;
import com.autocrowd.backend.dto.driver.TurnoverDTO;
import com.autocrowd.backend.dto.order.*;
import com.autocrowd.backend.entity.Order;
import java.math.BigDecimal;

import com.autocrowd.backend.entity.Review;

import java.util.List;
import java.util.Map;

public interface OrderService {
    Order createOrder(CreateOrderRequest request, String userId);

    /**
     * 价格预估
     * @param estimatePriceRequest 价格预估请求DTO
     * @return 预估价格信息
     */
    Map<String, Object> estimatePrice(EstimatePriceRequest estimatePriceRequest);

    /**
     * 获取用户当前订单
     * @param userId 用户ID
     * @return 当前订单响应DTO
     */
    CurrentOrderResponse getCurrentOrderByUserId(Integer userId);

    /**
     * 用户获取历史订单列表
     * @param userId 用户ID
     * @return 用户订单详情响应DTO列表
     */
    List<UserOrderDetailResponse> getUserHistoryOrders(Integer userId);

    /**
     * 车主获取历史订单列表
     * @param driverId 车主ID
     * @return 车主订单详情响应DTO列表
     */
    List<DriverOrderDetailResponse> getDriverHistoryOrders(Integer driverId);

    /**
     * 根据订单ID获取订单详情
     * @param orderId 订单ID
     * @return 订单详情
     */
    Order getOrderById(String orderId);

    /**
     * 车主接单
     * @param orderId 订单ID
     * @param driverId 车主ID
     * @param vehicleId 车辆ID
     * @return 接单后的订单
     */
    Order acceptOrder(String orderId, Integer driverId, Integer vehicleId);

    /**
     * 车主完成订单
     * @param orderId 订单ID
     * @param actualPrice 实际价格
     * @return 完成的订单
     */
    Order completeOrder(String orderId, BigDecimal actualPrice);

    /**
     * 用户评价订单
     * @param addReviewRequest 添加评价请求DTO
     * @param userId 用户ID
     */
    Review addReview(AddReviewRequest addReviewRequest, Integer userId);

    /**
     * 更新订单状态
     * @param orderId 订单ID
     * @param status 新的状态
     * @return 更新后的订单
     */
    Order updateOrderStatus(String orderId, Byte status);
    
    /**
     * 获取车主近七日营业额
     * @param driverId 车主ID
     * @return 近七日营业额数据列表
     */
    List<TurnoverDTO> getDriverTurnoverLast7Days(Integer driverId);
    
    /**
     * 获取车主近七月营业额
     * @param driverId 车主ID
     * @return 近七月营业额数据列表
     */
    List<TurnoverDTO> getDriverTurnoverLast7Months(Integer driverId);
}