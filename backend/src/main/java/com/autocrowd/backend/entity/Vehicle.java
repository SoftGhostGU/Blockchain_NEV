package com.autocrowd.backend.entity;

import jakarta.persistence.Entity;
import lombok.Data;
import jakarta.persistence.*;

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
    
    @Column(name = "`condition`")
    private String condition;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}