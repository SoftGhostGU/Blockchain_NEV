package com.autocrowd.backend.dto.vehicle;

import lombok.Data;

/**
 * 车辆更新请求DTO
 * 用于接收车辆更新请求的数据传输对象
 */
@Data
public class VehicleUpdateRequest {
    private Integer vehicleId;
    private Integer fuelLevel;
    private Integer conditionId;
    private String licensePlate;

    public Integer getVehicleId() {
        return vehicleId;
    }

    public void setVehicleId(Integer vehicleId) {
        this.vehicleId = vehicleId;
    }

    public Integer getFuelLevel() {
        return fuelLevel;
    }

    public void setFuelLevel(Integer fuelLevel) {
        this.fuelLevel = fuelLevel;
    }

    public Integer getConditionId() {
        return conditionId;
    }

    public void setConditionId(Integer conditionId) {
        this.conditionId = conditionId;
    }
    
    public String getLicensePlate() {
        return licensePlate;
    }
    
    public void setLicensePlate(String licensePlate) {
        this.licensePlate = licensePlate;
    }
}