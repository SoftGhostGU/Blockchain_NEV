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
    private BigDecimal fuelLevel;
    
    @Column(name = "condition_id", unique = true)
    private Integer conditionId;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Constructors, getters and setters are handled by Lombok @Data annotation
}