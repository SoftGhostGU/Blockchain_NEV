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

    @Column(name = "battery_percent")
    private Byte batteryPercent;

    @Column(name = "miles_to_go")
    private String milesToGo;

    @Column(name = "body_state")
    private Byte bodyState;

    @Column(name = "tire_pressure")
    private Byte tirePressure;

    @Column(name = "brake_state")
    private Byte brakeState;

    @Column(name = "power_state")
    private Byte powerState;

    // Constructors, getters and setters are handled by Lombok @Data annotation
}