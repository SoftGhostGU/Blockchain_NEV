package com.autocrowd.backend.dto.vehicle;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class VehicleDTO {
    private Integer vehicleId;
    private String licensePlate;
    private Integer driverId;
    private BigDecimal fuelLevel;
    private Integer conditionId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // 车辆状况信息占位符
    private String conditionInfo = "占位符：车辆状况信息";
    private String batteryPercent = "占位符：电池百分比";
    private String milesToGo = "占位符：续航里程";
    private String bodyState = "占位符：车身状态";
    private String tirePressure = "占位符：轮胎压力";
    private String brakeState = "占位符：刹车状态";
    private String powerState = "占位符：动力状态";
}