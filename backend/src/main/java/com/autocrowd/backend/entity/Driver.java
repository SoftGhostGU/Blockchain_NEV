package com.autocrowd.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "drivers")
public class Driver {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "driver_id")
    private Integer driverId;
    
    @Column(name = "username", nullable = false, unique = true)
    private String username;
    
    @Column(name = "phone", nullable = false, unique = true)
    private String phone;
    
    @Column(name = "password", nullable = false)
    private String password;
    
    @Column(name = "credit_score")
    private Integer creditScore;
    
    @Column(name = "wallet_balance")
    private BigDecimal walletBalance;
    
    @Column(name = "bank_card")
    private String bankCard;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "driver_service_quality")
    private Byte driverServiceQuality;
    
    @Column(name = "driver_punctuality")
    private Byte driverPunctuality;
    
    @Column(name = "driver_rating_avg", precision = 3, scale = 2)
    private BigDecimal driverRatingAvg;
    
    @Column(name = "driver_order_count")
    private Integer driverOrderCount;
    
    // Constructors, getters and setters are handled by Lombok @Data annotation
}