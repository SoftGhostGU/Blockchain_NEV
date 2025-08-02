package com.autocrowd.backend.dto.order;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Data
@Getter
@Setter
public class CreateOrderRequest {
    private String startLocation;
    private String destination;
    private String vehicleType;
    private Integer driverId;
    private Integer vehicleId;
    private BigDecimal estimatedPrice;
}