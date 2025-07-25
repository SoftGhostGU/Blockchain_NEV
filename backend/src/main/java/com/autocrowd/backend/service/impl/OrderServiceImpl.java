package com.autocrowd.backend.service.impl;

import com.autocrowd.backend.dto.CreateOrderRequest;
import com.autocrowd.backend.entity.Order;
import com.autocrowd.backend.exception.ExceptionCodeEnum;
import com.autocrowd.backend.exception.BusinessException;
import com.autocrowd.backend.repository.OrderRepository;
import com.autocrowd.backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;

    @Override
    public Order createOrder(CreateOrderRequest request) {
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
            order.setCreatedAt(LocalDateTime.now());
            order.setUpdatedAt(LocalDateTime.now());
            Order savedOrder = orderRepository.save(order);
            System.out.println("[OrderService] 订单创建成功: ID=" + savedOrder.getOrderId());
            return savedOrder;
        } catch (Exception e) {
            System.err.println("[OrderService] 订单创建失败: " + e.getMessage());
            throw new BusinessException(ExceptionCodeEnum.ORDER_CREATE_FAILED, e);
        }
    }
}