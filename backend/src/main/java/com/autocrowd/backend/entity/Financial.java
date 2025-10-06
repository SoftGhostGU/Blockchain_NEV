package com.autocrowd.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "financials")
public class Financial {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "financial_id")
    private Integer financialId;

    @JoinColumn(name = "user_id")
    private Integer userId;

    @Column(name = "role")
    private String role;

    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", nullable = false)
    private TransactionType transactionType;
    
    @Column(name = "amount", nullable = false)
    private BigDecimal amount;
    
    @Column(name = "transaction_time")
    private LocalDateTime transactionTime;
    
    public enum TransactionType {
        Withdrawal, Earnings, Recharge, Expenses
    }

}