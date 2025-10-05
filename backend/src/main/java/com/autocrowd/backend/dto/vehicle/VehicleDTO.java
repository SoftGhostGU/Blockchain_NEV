package com.autocrowd.backend.dto.vehicle;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class VehicleDTO {
    private Integer vehicleId;
    private String licensePlate;
    private Integer driverId;
    private Integer fuelLevel;
    private Integer conditionId;
    private Byte status; // 车辆状态(1=可接单,2=不可接单)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // 车辆状况信息（实际数据）
    private String vehicleModel;       // 车辆型号
    private Byte batteryPercent;       // 电池百分比
    private String milesToGo;          // 续航里程
    private String bodyState;          // 车身状态（正常/注意/危险）
    private String tirePressure;       // 轮胎气压（正常/注意/危险）
    private String brakeState;         // 制动系统（正常/注意/危险）
    private String powerState;         // 动力系统（正常/注意/危险）
}