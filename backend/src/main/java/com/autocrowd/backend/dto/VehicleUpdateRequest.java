package com.autocrowd.backend.dto;

import lombok.Data;

@Data
public class VehicleUpdateRequest {
    private Integer fuelLevel;
    private String condition;
    private Integer vehicleId;
}