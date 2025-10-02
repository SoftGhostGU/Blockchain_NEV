package com.autocrowd.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "vehicle_condition")
public class VehicleCondition {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "condition_id")
    private Integer conditionId;

    @Column(name = "vehicle_model")
    private String vehicleModel;         // 车辆型号（如：特斯拉 Model 3）

    @Column(name = "battery_percent")
    private Byte batteryPercent;

    @Column(name = "miles_to_go")
    private String milesToGo;

    @Column(name = "body_state")
    private Byte bodyState;              // 车身状态（1-正常 2-注意 3-危险）

    @Column(name = "tire_pressure")
    private Byte tirePressure;           // 轮胎气压（1-正常 2-注意 3-危险）

    @Column(name = "brake_state")
    private Byte brakeState;             // 制动系统（1-正常 2-注意 3-危险）

    @Column(name = "power_state")
    private Byte powerState;             // 动力系统（1-正常 2-注意 3-危险）

    // Constructors, getters and setters are handled by Lombok @Data annotation
}