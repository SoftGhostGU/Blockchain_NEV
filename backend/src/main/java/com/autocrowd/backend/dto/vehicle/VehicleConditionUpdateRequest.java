package com.autocrowd.backend.dto.vehicle;

import lombok.Data;

/**
 * 车辆状况更新请求DTO
 * 用于接收车辆状况更新请求的数据传输对象
 */
@Data
public class VehicleConditionUpdateRequest {
    private Integer conditionId;
    private String vehicleModel;         // 车辆型号
    private Byte batteryPercent;         // 电池百分比
    private String milesToGo;           // 续航里程
    private Byte bodyState;              // 车身状态（1-正常 2-注意 3-危险）
    private Byte tirePressure;           // 轮胎气压（1-正常 2-注意 3-危险）
    private Byte brakeState;             // 制动系统（1-正常 2-注意 3-危险）
    private Byte powerState;             // 动力系统（1-正常 2-注意 3-危险）
    private String licensePlate;         // 车牌号码
}