package com.autocrowd.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Integer userId;
    
    @Column(name = "username", nullable = false, unique = true)
    private String username;
    
    @Column(name = "phone", nullable = false, unique = true)
    private String phone;
    
    @Column(name = "password", nullable = false)
    private String password;
    
    @Column(name = "credit_score")
    private Integer creditScore;
    
    @Column(name = "balance")
    private BigDecimal balance;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}