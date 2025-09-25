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

    // 存储起始位置的密文（前端加密后传入）
    @Column(name = "start_location", nullable = false)
    private String startLocation;

    // 存储目的地的密文（前端加密后传入）
    @Column(name = "destination", nullable = false)
    private String destination;

    @Column(name = "status")
    @JsonProperty("orderStatus")
    private Byte status;

    // 存储预估价格的密文（前端加密后传入）
    @Column(name = "estimated_price")
    private BigDecimal estimatedPrice;

    // 存储实际价格的密文（前端加密后传入）
    @Column(name = "actual_price")
    private BigDecimal actualPrice;

    
    @Column(name = "estimated_time")
    private Integer estimatedTime;
    
    @Column(name = "actual_time")
    private Integer actualTime;

    @Column(name = "created_at")
    @JsonProperty("createdTime")
    private LocalDateTime createdAt;
    
    @Column(name = "type")
    @JsonProperty("orderType")
    private String type;
    

    @Column(name = "updated_at")
    @JsonProperty("updatedTime")
    private LocalDateTime updatedAt;
    
    // IBE访问策略字段
    @Column(name = "access_policy")
    private String accessPolicy;
    
    // 用户偏好设置和位置信息
    @Column(name = "user_credit")
    private Integer userCredit;
    
    @Column(name = "user_pref_quiet")
    private Byte userPrefQuiet;
    
    @Column(name = "user_pref_speed")
    private Byte userPrefSpeed;
    
    @Column(name = "user_pref_car_type")
    private Byte userPrefCarType;
    
    @Column(name = "start_lat", precision = 10, scale = 8)
    private BigDecimal startLat;
    
    @Column(name = "start_lon", precision = 11, scale = 8)
    private BigDecimal startLon;
    
    @Column(name = "dest_lat", precision = 10, scale = 8)
    private BigDecimal destLat;
    
    @Column(name = "dest_lon", precision = 11, scale = 8)
    private BigDecimal destLon;
}