package com.autocrowd.backend.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class VehicleDTO {
    private Integer vehicleId;
    private String licensePlate;
    private Integer driverId;
    private BigDecimal fuelLevel;
    private String condition;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}