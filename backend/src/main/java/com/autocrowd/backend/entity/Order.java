package com.autocrowd.backend.entity;

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
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_id")
    private Integer orderId;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    @ManyToOne
    @JoinColumn(name = "driver_id")
    private Driver driver;
    
    @Column(name = "start_location", nullable = false)
    private String startLocation;
    
    @Column(name = "destination", nullable = false)
    private String destination;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private OrderStatus status;
    
    @Column(name = "estimated_price")
    private BigDecimal estimatedPrice;
    
    @Column(name = "actual_price")
    private BigDecimal actualPrice;
    
    @Column(name = "review_id")
    private Integer reviewId;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    public enum OrderStatus {
        @Enumerated(EnumType.STRING)
        @Column(name = "Waiting")
        Waiting,
        @Enumerated(EnumType.STRING)
        @Column(name = "On the way")
        On_the_way,
        @Enumerated(EnumType.STRING)
        @Column(name = "In progress")
        In_progress,
        @Enumerated(EnumType.STRING)
        @Column(name = "Completed")
        Completed
    }
}