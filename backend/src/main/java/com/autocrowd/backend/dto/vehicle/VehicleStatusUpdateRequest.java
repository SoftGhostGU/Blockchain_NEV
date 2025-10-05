package com.autocrowd.backend.dto.vehicle;

import lombok.Data;

@Data
public class VehicleStatusUpdateRequest {
    private Integer vehicleId;
    private Byte status; // 车辆状态(1=可接单,2=不可接单)
}