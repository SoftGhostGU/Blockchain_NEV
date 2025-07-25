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
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}