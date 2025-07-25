package com.autocrowd.backend.service;

import com.autocrowd.backend.dto.CreateOrderRequest;
import com.autocrowd.backend.entity.Order;
import java.math.BigDecimal;

import com.autocrowd.backend.entity.Order;

public interface OrderService {
    Order createOrder(CreateOrderRequest request);
}