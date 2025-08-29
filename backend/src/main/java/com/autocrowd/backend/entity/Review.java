package com.autocrowd.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "reviews")
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "review_id")
    private Integer reviewId;

    @Column(name = "order_id")
    private String orderId;

    @Column(name = "user_id")
    private Integer userId;
    
    @Column(name = "driver_id")
    private Integer driverId;
    
    @Column(name = "content")
    private String content;
    
    @Column(name = "comment_star")
    private BigDecimal commentStar;
    
    @Column(name = "audit_status")
    private Byte auditStatus = 1; // 默认审核状态为1（待审核）
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}