package com.autocrowd.backend.dto.order;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class CreateOrderRequest {
    private String startLocation;
    private String destination;
    private BigDecimal estimatedPrice;
    private String type;
    private Integer estimatedTime;
}