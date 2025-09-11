package com.autocrowd.backend.repository;

import com.autocrowd.backend.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, String> {
    List<Order> findByUserId(Integer userId);
    List<Order> findByDriverId(Integer driverId);
    Page<Order> findByOrderIdContaining(String orderId, Pageable pageable);
    Page<Order> findByStatus(Byte status, Pageable pageable);
    
    // 添加缺失的方法
    List<Order> findByUserIdAndStatus(Integer userId, Byte status);
    List<Order> findByDriverIdAndStatus(Integer driverId, Byte status);
}