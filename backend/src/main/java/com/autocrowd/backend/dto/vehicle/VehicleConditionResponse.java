package com.autocrowd.backend.dto.vehicle;

import lombok.Data;

/**
 * 车辆状况响应DTO
 * 包含车辆状况信息和来自Vehicle表的相关字段
 */
@Data
public class VehicleConditionResponse {
    // 来自VehicleCondition表的字段
    private Integer conditionId;
    private String vehicleModel;         // 车辆型号
    private Byte batteryPercent;         // 电池百分比
    private String milesToGo;           // 续航里程
    private Byte bodyState;              // 车身状态（1-正常 2-注意 3-危险）
    private Byte tirePressure;           // 轮胎气压（1-正常 2-注意 3-危险）
    private Byte brakeState;             // 制动系统（1-正常 2-注意 3-危险）
    private Byte powerState;             // 动力系统（1-正常 2-注意 3-危险）
    
    // 来自Vehicle表的字段
    private String licensePlate;         // 车牌号码
    private Byte auditStatus;            // 审核状态（1=待审核,2=已通过,3=已拒绝）
}