package com.autocrowd.backend.dto.order;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class SelectVehicleRequest {
    private String orderId;
    private Integer vehicleId;
    private Integer userCredit;
    private Byte userPrefQuiet;
    private Byte userPrefSpeed;
    private Byte userPrefCarType;
    private BigDecimal startLat;
    private BigDecimal startLon;
    private BigDecimal destLat;
    private BigDecimal destLon;
}