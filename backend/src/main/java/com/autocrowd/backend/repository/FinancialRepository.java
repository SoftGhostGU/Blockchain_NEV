package com.autocrowd.backend.repository;

import com.autocrowd.backend.entity.Financial;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface FinancialRepository extends JpaRepository<Financial, Integer> {
    List<Financial> findByUserId(Integer userId);
    List<Financial> findByRole(String role);
    Page<Financial> findByUserId(Integer userId, Pageable pageable);
    Page<Financial> findByTransactionType(String transactionType, Pageable pageable);
    
    // 添加缺失的方法
    List<Financial> findByRoleAndUserIdAndTransactionTimeBetween(
            String role, Integer userId, LocalDateTime startTime, LocalDateTime endTime);
            
    List<Financial> findByRoleAndUserIdAndTransactionTypeAndTransactionTimeBetween(
            String role, Integer userId, Financial.TransactionType transactionType, 
            LocalDateTime startTime, LocalDateTime endTime);
}