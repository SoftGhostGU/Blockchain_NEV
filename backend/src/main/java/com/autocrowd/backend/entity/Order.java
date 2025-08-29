package com.autocrowd.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "orders")
public class Order {
    @Id
    @Column(name = "order_id")
    private String orderId;

    @Column(name = "user_id")
    private Integer userId;

    @Column(name = "driver_id")
    private Integer driverId;

    @Column(name = "vehicle_id")
    private Integer vehicleId;

    @Column(name = "start_location", nullable = false)
    private String startLocation;

    @Column(name = "destination", nullable = false)
    private String destination;

    @Column(name = "status")
    private Byte status;

    @Column(name = "estimated_price")
    private BigDecimal estimatedPrice;

    @Column(name = "actual_price")
    private BigDecimal actualPrice;

    @Column(name = "type")
    private String type;
    
    @Column(name = "estimated_time")
    private Integer estimatedTime;
    
    @Column(name = "actual_time")
    private Integer actualTime;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}