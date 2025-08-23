package com.autocrowd.backend.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
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
    @JsonProperty("orderID")
    private String orderId;
    
    @Column(name = "user_id")
    @JsonProperty("userID")
    private Integer userId;
    
    @Column(name = "driver_id")
    @JsonProperty("driverID")
    private Integer driverId;

    @Column(name = "vehicle_id")
    @JsonProperty("vehicleID")
    private Integer vehicleId;

    @Column(name = "start_location", nullable = false)
    private String startLocation;
    
    @Column(name = "destination", nullable = false)
    private String destination;
    
    @Column(name = "status")
    @JsonProperty("orderStatus")
    private Byte status;
    
    @Column(name = "estimated_price")
    private BigDecimal estimatedPrice;
    
    @Column(name = "actual_price")
    private BigDecimal actualPrice;
    
    
    @Column(name = "created_at")
    @JsonProperty("createdTime")
    private LocalDateTime createdAt;
    
    @Column(name = "type")
    @JsonProperty("orderType")
    private String type;
    
    @Column(name = "updated_at")
    @JsonProperty("updatedTime")
    private LocalDateTime updatedAt;
}