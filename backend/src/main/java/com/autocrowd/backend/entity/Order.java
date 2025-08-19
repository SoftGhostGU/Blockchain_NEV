package com.autocrowd.backend.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

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
    
    
    @Column(name = "created_at")
//    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
    
    @Column(name = "type")
    private String type;
    
    @Column(name = "updated_at")
//    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;
}