package com.autocrowd.backend.repository;

import com.autocrowd.backend.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
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
    
    // 按时间范围查询订单
    List<Order> findByUserIdAndCreatedAtBetween(Integer userId, LocalDateTime startTime, LocalDateTime endTime);
    List<Order> findByDriverIdAndCreatedAtBetween(Integer driverId, LocalDateTime startTime, LocalDateTime endTime);
    
    // 按状态和时间范围查询订单
    List<Order> findByUserIdAndStatusAndCreatedAtBetween(Integer userId, Byte status, LocalDateTime startTime, LocalDateTime endTime);
    List<Order> findByDriverIdAndStatusAndCreatedAtBetween(Integer driverId, Byte status, LocalDateTime startTime, LocalDateTime endTime);
    
    // 根据车辆ID查找订单
    List<Order> findByVehicleIdAndStatus(Integer vehicleId, Byte status);
}