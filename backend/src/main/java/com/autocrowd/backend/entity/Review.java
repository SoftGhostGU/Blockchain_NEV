package com.autocrowd.backend.entity;

import jakarta.persistence.*;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

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
    private Integer order;

    @Column(name = "user_id")
    private Integer user;
    
    @ManyToOne
    @JoinColumn(name = "driver_id")
    private Driver driver;
    
    @Column(name = "content")
    private String content;
    
    @Column(name = "rating")
    private Integer rating;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}