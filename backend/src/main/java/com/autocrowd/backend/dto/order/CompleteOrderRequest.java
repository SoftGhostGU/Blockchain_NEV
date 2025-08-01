package com.autocrowd.backend.dto.order;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class CompleteOrderRequest {
    private String orderId;
    private BigDecimal actualPrice;
}