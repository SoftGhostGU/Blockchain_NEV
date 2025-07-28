package com.autocrowd.backend.service.impl;

import com.autocrowd.backend.dto.CreateOrderRequest;
import com.autocrowd.backend.dto.EstimatePriceRequest;
import com.autocrowd.backend.entity.Order;
import com.autocrowd.backend.entity.Driver;
import com.autocrowd.backend.entity.Vehicle;
import com.autocrowd.backend.exception.ExceptionCodeEnum;
import com.autocrowd.backend.exception.BusinessException;
import com.autocrowd.backend.repository.DriverRepository;
import com.autocrowd.backend.repository.OrderRepository;
import com.autocrowd.backend.repository.VehicleRepository;
import com.autocrowd.backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

import com.autocrowd.backend.dto.CurrentOrderResponse;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {
    
    private final OrderRepository orderRepository;
    private final DriverRepository driverRepository;
    private final VehicleRepository vehicleRepository;
    /**
     * 创建新订单
     * @param request 创建订单请求DTO
     * @param userId 用户ID
     * @return 创建的订单实体
     * @throws BusinessException 当参数无效或创建失败时抛出
     */
    @Override
    public Order createOrder(CreateOrderRequest request, String userId) {
        try {
            // 验证请求参数
            if (request.getStartLocation() == null || request.getStartLocation().trim().isEmpty()) {
                throw new BusinessException(ExceptionCodeEnum.PARAM_ERROR, "出发地不能为空");
            }
            if (request.getDestination() == null || request.getDestination().trim().isEmpty()) {
                throw new BusinessException(ExceptionCodeEnum.PARAM_ERROR, "目的地不能为空");
            }
            if (request.getVehicleType() == null || request.getVehicleType().trim().isEmpty()) {
                throw new BusinessException(ExceptionCodeEnum.PARAM_ERROR, "车辆类型不能为空");
            }

            System.out.println("[OrderService] 收到创建订单请求: 起点=" + request.getStartLocation() + ", 终点=" + request.getDestination() + ", 车辆类型=" + request.getVehicleType());
            Order order = new Order();
            order.setStartLocation(request.getStartLocation());
            order.setDestination(request.getDestination());
            order.setStatus(Order.OrderStatus.Waiting);
            //将预估价格设定为占位字符串
            order.setEstimatedPrice(new BigDecimal("0"));
            order.setCreatedAt(LocalDateTime.now());
            order.setUpdatedAt(LocalDateTime.now());
            order.setUser(Integer.parseInt(userId));
            Order savedOrder = orderRepository.save(order);
            System.out.println("[OrderService] 订单创建成功: ID=" + savedOrder.getOrderId());
            return savedOrder;
        } catch (Exception e) {
            System.err.println("[OrderService] 订单创建失败: " + e.getMessage());
            throw new BusinessException(ExceptionCodeEnum.ORDER_CREATE_FAILED, e);
        }
    }

    /**
     * 获取当前进行中的订单
     * @return 当前订单响应DTO，包含订单详情、司机信息和车辆信息
     * @throws BusinessException 当获取订单失败时抛出
     */
    @Override
    public List<CurrentOrderResponse> getAllCurrentOrder() {
        try {
            // 查询状态为Waiting、In progress和On the way的订单
            List<Order> activeOrders = orderRepository.findByStatusIn(
                Arrays.asList(Order.OrderStatus.Waiting, Order.OrderStatus.In_progress, Order.OrderStatus.On_the_way)
            );

            List<CurrentOrderResponse> responses = new ArrayList<>();
            for (Order order : activeOrders) {
                // 转换为响应DTO
                CurrentOrderResponse response = new CurrentOrderResponse();
                response.setOrder_id(order.getOrderId());
                response.setStatus(order.getStatus().name().replace('_', ' '));
                response.setStart_location(order.getStartLocation());
                response.setDestination(order.getDestination());
                response.setCreated_at(order.getCreatedAt());

                // 设置司机信息（如果有）
                if (order.getDriver() != null) {
                    Driver driver = driverRepository.findById(order.getDriver())
                        .orElseThrow(() -> new BusinessException(ExceptionCodeEnum.DRIVER_NOT_FOUND, "司机不存在"));
                    
                    CurrentOrderResponse.DriverInfoDTO driverDTO = new CurrentOrderResponse.DriverInfoDTO();
                    driverDTO.setDriver_id(driver.getDriverId());
                    driverDTO.setUsername(driver.getUsername());
                    driverDTO.setPhone(driver.getPhone());
                    driverDTO.setLocation("LOCATION_PLACEHOLDER");

                    // 设置车辆信息（如果有）
                    if (order.getVehicleId() != null) {
                        Vehicle vehicle = vehicleRepository.findById(order.getVehicleId())
                            .orElseThrow(() -> new BusinessException(ExceptionCodeEnum.VEHICLE_NOT_FOUND, "车辆不存在"));
                        
                        CurrentOrderResponse.VehicleInfoDTO vehicleDTO = new CurrentOrderResponse.VehicleInfoDTO();
                        vehicleDTO.setLicense_plate(vehicle.getLicensePlate());
                        vehicleDTO.setFuel_level(vehicle.getFuelLevel().doubleValue());
                        driverDTO.setVehicle(vehicleDTO);
                    }

                    response.setDriver(driverDTO);
                }
                responses.add(response);
            }
            return responses;
        } catch (Exception e) {
            System.err.println("[OrderService] 获取当前订单失败: " + e.getMessage());
            throw new BusinessException(ExceptionCodeEnum.ORDER_GET_FAILED, "获取当前订单失败");
        }
    }

    @Override
    public List<Order> getCurrentOrderByStatus(String status) {
        try {
            Order.OrderStatus orderStatus = Order.OrderStatus.valueOf(status.replace(" ", "_"));
            return orderRepository.findByStatus(orderStatus);
        } catch (IllegalArgumentException e) {
            throw new BusinessException(ExceptionCodeEnum.PARAM_ERROR, "无效的订单状态: " + status);
        }
    }

    @Override
    public Order acceptOrder(Integer orderId, String driverId, Integer vehicleId) {
        try {
            // 验证参数
            if (orderId == null) {
                throw new BusinessException(ExceptionCodeEnum.PARAM_ERROR, "订单ID不能为空");
            }
            if (driverId == null || driverId.trim().isEmpty()) {
                throw new BusinessException(ExceptionCodeEnum.PARAM_ERROR, "车主ID不能为空");
            }
            if (vehicleId == null) {
                throw new BusinessException(ExceptionCodeEnum.PARAM_ERROR, "车辆ID不能为空");
            }

            // 查询订单
            Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException(ExceptionCodeEnum.ORDER_NOT_FOUND, "订单不存在"));

            // 验证订单状态是否为Waiting
            if (order.getStatus() != Order.OrderStatus.Waiting) {
                throw new BusinessException(ExceptionCodeEnum.ORDER_STATUS_ERROR, "只有等待中的订单可以被接单");
            }

            // 验证车主是否存在
            Driver driver = driverRepository.findById(Integer.parseInt(driverId))
                .orElseThrow(() -> new BusinessException(ExceptionCodeEnum.DRIVER_NOT_FOUND, "车主不存在"));

            // 验证车辆是否属于该车主
            boolean vehicleBelongsToDriver = vehicleRepository.existsByVehicleIdAndDriverId(vehicleId, Integer.parseInt(driverId));
            if (!vehicleBelongsToDriver) {
                throw new BusinessException(ExceptionCodeEnum.VEHICLE_NOT_BELONG_TO_DRIVER, "车辆不属于该车主");
            }

            // 更新订单信息
            order.setDriver(driver.getDriverId());
            order.setVehicleId(vehicleId);
            order.setStatus(Order.OrderStatus.On_the_way);
            order.setUpdatedAt(LocalDateTime.now());

            Order updatedOrder = orderRepository.save(order);
            System.out.println("[OrderService] 车主接单成功: 订单ID=" + orderId + ", 车主ID=" + driverId);
            return updatedOrder;
        } catch (BusinessException e) {
            System.err.println("[OrderService] 车主接单失败: " + e.getMessage());
            throw e;
        } catch (Exception e) {
            System.err.println("[OrderService] 车主接单系统异常: " + e.getMessage());
            throw new BusinessException(ExceptionCodeEnum.ORDER_ACCEPT_FAILED, "接单失败");
        }
    }

    /**
     * 更新订单状态
     * @param orderId 订单ID
     * @param status 新订单状态
     * @return 更新后的订单实体
     * @throws BusinessException 当订单不存在或状态无效时抛出
     */
    @Override
    public Order updateOrderStatus(Integer orderId, String status) {
        try {
            // 验证参数
            if (orderId == null) {
                throw new BusinessException(ExceptionCodeEnum.PARAM_ERROR, "订单ID不能为空");
            }
            if (status == null || status.trim().isEmpty()) {
                throw new BusinessException(ExceptionCodeEnum.PARAM_ERROR, "订单状态不能为空");
            }

            // 查询订单
            Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException(ExceptionCodeEnum.ORDER_NOT_FOUND, "订单不存在"));

            // 验证并转换状态
            Order.OrderStatus newStatus;
            try {
                newStatus = Order.OrderStatus.valueOf(status.replace(" ", "_"));
            } catch (IllegalArgumentException e) {
                throw new BusinessException(ExceptionCodeEnum.PARAM_ERROR, "无效的订单状态: " + status);
            }

            // 更新订单状态
            order.setStatus(newStatus);
            order.setUpdatedAt(LocalDateTime.now());
            return orderRepository.save(order);
        } catch (BusinessException e) {
            System.err.println("[OrderService] 更新订单状态失败: " + e.getMessage());
            throw e;
        } catch (Exception e) {
            System.err.println("[OrderService] 更新订单状态系统异常: " + e.getMessage());
            throw new BusinessException(ExceptionCodeEnum.ORDER_UPDATE_FAILED, "更新订单状态失败");
        }
    }

    /**
     * 预估订单价格
     * @param request 价格预估请求DTO
     * @return 包含预估价格、距离和时长的Map
     * @throws BusinessException 当参数无效时抛出
     */
    @Override
    public Map<String, Object> estimatePrice(EstimatePriceRequest request) {
        try {
            // 验证请求参数
            if (request.getStartLocation() == null || request.getStartLocation().trim().isEmpty()) {
                throw new BusinessException(ExceptionCodeEnum.PARAM_ERROR, "起始位置不能为空");
            }
            if (request.getDestination() == null || request.getDestination().trim().isEmpty()) {
                throw new BusinessException(ExceptionCodeEnum.PARAM_ERROR, "目的地不能为空");
            }

            System.out.println("[OrderService] 收到价格预估请求: 起点=" + request.getStartLocation() + ", 终点=" + request.getDestination() + ", 车辆类型=" + request.getVehicle_type());

            // 使用占位符返回预估结果
            Map<String, Object> result = new HashMap<>();
            result.put("estimated_price", "PLACEHOLDER_PRICE");
            result.put("distance_km", "PLACEHOLDER_DISTANCE");
            result.put("duration_min", "PLACEHOLDER_DURATION");

            return result;
        } catch (BusinessException e) {
            System.err.println("[OrderService] 价格预估失败: " + e.getMessage());
            throw e;
        } catch (Exception e) {
            System.err.println("[OrderService] 价格预估系统异常: " + e.getMessage());
            throw new BusinessException(ExceptionCodeEnum.PRICE_ESTIMATION_FAILED, "价格预估失败");
        }
    }
}