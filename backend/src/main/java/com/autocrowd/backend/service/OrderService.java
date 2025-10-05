package com.autocrowd.backend.service;

import com.autocrowd.backend.dto.order.AddReviewRequest;
import com.autocrowd.backend.dto.order.CreateOrderRequest;
import com.autocrowd.backend.dto.order.CurrentOrderResponse;
import com.autocrowd.backend.dto.driver.DriverOrderDetailResponse;
import com.autocrowd.backend.dto.order.EstimatePriceRequest;
import com.autocrowd.backend.dto.order.SelectVehicleRequest;
import com.autocrowd.backend.dto.driver.TurnoverDTO;
import com.autocrowd.backend.dto.order.UserOrderDetailResponse;
import com.autocrowd.backend.dto.order.OrderTypeDistributionDTO;
import com.autocrowd.backend.dto.order.StarDistributionDTO;
import com.autocrowd.backend.dto.financial.WithdrawableBalanceDTO;
import com.autocrowd.backend.dto.vehicle.VehicleDTO;
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
    
    /**
     * 获取本月订单类型分布
     * @param userId 用户ID
     * @param role 用户角色 (user/driver)
     * @return 本月每种订单类型的数量
     */
    List<OrderTypeDistributionDTO> getMonthlyOrderTypeDistribution(Integer userId, String role);
    
    /**
     * 获取评价分布
     * @param userId 用户ID
     * @param role 用户角色 (user/driver)
     * @return 评价星级分布
     */
    List<StarDistributionDTO> getStarDistribution(Integer userId, String role);
    
    /**
     * 获取可提现余额
     * @param userId 用户ID
     * @param role 用户角色 (user/driver)
     * @return 可提现余额信息
     */
    WithdrawableBalanceDTO getWithdrawableBalance(Integer userId, String role);
    
    /**
     * 用户完成订单
     * @param orderId 订单ID
     * @param actualPrice 实际价格
     * @param userId 用户ID
     * @return 完成的订单
     */
    Order completeOrderByUser(String orderId, BigDecimal actualPrice, Integer userId);
    
    /**
     * 获取可接单的车辆列表
     * @return 可接单车辆列表
     */
    List<VehicleDTO> getAvailableVehicles();
    
    /**
     * 取消订单
     * @param orderId 订单ID
     * @param userId 用户ID
     * @return 取消的订单
     */
    Order cancelOrder(String orderId, Integer userId);
}