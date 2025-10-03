package com.autocrowd.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "vehicles")
public class Vehicle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "vehicle_id")
    private Integer vehicleId;
    
    @Column(name = "license_plate", nullable = false, unique = true)
    private String licensePlate;

    @Column(name = "driver_id")
    private Integer driverId;
    
    @Column(name = "fuel_level")
    private Integer fuelLevel;
    
    @Column(name = "condition_id", unique = true)
    private Integer conditionId;
    
    @Column(name = "audit_status")
    private Byte auditStatus = 1; // 默认审核状态为1（待审核）
    
    @Column(name = "status")
    private Byte status = 1; // 车辆状态(1=可接单,2=不可接单)
    
    // 新增的4个字段
    @Column(name = "car_cleanliness")
    private Byte carCleanliness;
    
    @Column(name = "car_type")
    private Byte carType;
    
    @Column(name = "lat", precision = 10, scale = 8)
    private BigDecimal lat;
    
    @Column(name = "lon", precision = 11, scale = 8)
    private BigDecimal lon;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Constructors, getters and setters are handled by Lombok @Data annotation
}