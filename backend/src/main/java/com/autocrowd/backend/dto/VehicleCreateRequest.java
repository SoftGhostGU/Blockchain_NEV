package com.autocrowd.backend.dto;

import lombok.Data;

import java.math.BigDecimal;

/**
 * 车辆创建请求DTO
 * 用于接收前端传递的车辆信息，作为创建新车辆记录的数据传输对象
 */
@Data
public class VehicleCreateRequest {
    /**
     * 车牌号
     * 车辆的唯一标识号码
     */
    private String licensePlate;
    /**
     * 燃油水平
     * 车辆当前的燃油量，以百分比表示
     */
    private BigDecimal fuelLevel;
    /**
     * 车辆状况ID
     * 关联车辆状况表的ID
     */
    private Integer conditionId;

    public String getLicensePlate() {
        return licensePlate;
    }

    public void setLicensePlate(String licensePlate) {
        this.licensePlate = licensePlate;
    }

    public BigDecimal getFuelLevel() {
        return fuelLevel;
    }

    public void setFuelLevel(BigDecimal fuelLevel) {
        this.fuelLevel = fuelLevel;
    }

    public Integer getConditionId() {
        return conditionId;
    }

    public void setConditionId(Integer conditionId) {
        this.conditionId = conditionId;
    }
}