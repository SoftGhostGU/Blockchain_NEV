package com.autocrowd.backend.dto.order;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class CreateOrderRequest {
    // 存储起始位置的密文（前端加密后传入）
    private String startLocation;
    // 存储目的地的密文（前端加密后传入）
    private String destination;
    // 存储预估价格的密文（前端加密后传入）
    private BigDecimal estimatedPrice;
    private String type;
    private Integer estimatedTime;
}