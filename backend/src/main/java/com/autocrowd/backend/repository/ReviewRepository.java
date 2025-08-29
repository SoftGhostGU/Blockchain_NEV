package com.autocrowd.backend.repository;

import com.autocrowd.backend.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Integer> {
    List<Review> findByOrderId(String orderId);
    List<Review> findByUserId(Integer userId);
    List<Review> findByDriverId(Integer driverId);
    
    @Query("SELECT r FROM Review r WHERE r.auditStatus = ?1")
    List<Review> findByAuditStatus(Byte auditStatus);
    
    Page<Review> findAll(Pageable pageable);
}