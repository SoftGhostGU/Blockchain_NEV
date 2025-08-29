package com.autocrowd.backend.dto.order;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class OrderDTO {
    private String orderId;
    private Integer userId;
    private Integer driverId;
    private Integer vehicleId;
    private String startLocation;
    private String destination;
    private Byte status;
    private BigDecimal estimatedPrice;
    private BigDecimal actualPrice;
    private String type;
    private Integer estimatedTime;
    private Integer actualTime;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}