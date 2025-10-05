package com.autocrowd.backend.dto.order;

import lombok.Data;

/**
 * 订单类型分布DTO
 */
@Data
public class OrderTypeDistributionDTO {
    private String orderType;  // 订单类型名称
    private Long count;        // 该类型的订单数量
    
    public OrderTypeDistributionDTO(String orderType, Long count) {
        this.orderType = orderType;
        this.count = count;
    }
}