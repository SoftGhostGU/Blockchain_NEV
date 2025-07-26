package com.autocrowd.backend.repository;

import com.autocrowd.backend.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {
    List<Order> findByStatusIn(List<Order.OrderStatus> statuses);
    List<Order> findByStatus(Order.OrderStatus status);
}