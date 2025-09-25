package com.autocrowd.backend.service;

import com.autocrowd.backend.dto.order.AddReviewRequest;
import com.autocrowd.backend.dto.order.CreateOrderRequest;
import com.autocrowd.backend.dto.order.CurrentOrderResponse;
import com.autocrowd.backend.dto.driver.DriverOrderDetailResponse;
import com.autocrowd.backend.dto.order.EstimatePriceRequest;
import com.autocrowd.backend.dto.order.SelectVehicleRequest;
import com.autocrowd.backend.dto.driver.TurnoverDTO;
import com.autocrowd.backend.dto.order.UserOrderDetailResponse;
import com.autocrowd.backend.entity.Order;
import com.autocrowd.backend.entity.Review;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * 订单服务接口
 */
public interface OrderService {
    Order createOrder(CreateOrderRequest request, String userId);
    
    Order selectVehicleForOrder(SelectVehicleRequest request, Integer userId);
    
    Order getOrderById(String orderId);
    
    Order updateOrderStatus(String orderId, Byte status);
    
    Order acceptOrder(String orderId, Integer driverId, Integer vehicleId);
    
    Order completeOrder(String orderId, BigDecimal actualPrice);
    
    CurrentOrderResponse getCurrentOrderByUserId(Integer userId);
    
    Review addReview(AddReviewRequest request, Integer userId);

    TurnoverDTO getDriverRecent7DaysTurnover(Integer driverId);

    TurnoverDTO getDriverRecent6MonthsTurnover(Integer driverId);

    void createFinancialRecords(Order order, BigDecimal actualPrice);
    
    /**
     * 价格预估
     * @param request 预估请求参数
     * @return 预估价格信息
     */
    Map<String, Object> estimatePrice(EstimatePriceRequest request);
    
    /**
     * 获取用户的历史订单（已完成的订单）
     * @param userId 用户ID
     * @return 订单详情列表
     */
    List<UserOrderDetailResponse> getUserHistoryOrders(Integer userId);
    
    /**
     * 获取司机的历史订单（已完成的订单）
     * @param driverId 司机ID
     * @return 订单详情列表
     */
    List<DriverOrderDetailResponse> getDriverHistoryOrders(Integer driverId);
    
    /**
     * 获取车主近七日营业额
     * @param driverId 车主ID
     * @return 近七日营业额数据列表
     */
    List<TurnoverDTO> getDriverTurnoverLast7Days(Integer driverId);
    
    /**
     * 获取车主近六月营业额
     * @param driverId 车主ID
     * @return 近六月营业额数据列表
     */
    List<TurnoverDTO> getDriverTurnoverLast7Months(Integer driverId);
}