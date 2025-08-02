package com.autocrowd.backend.repository;

import com.autocrowd.backend.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Integer> {
    List<Review> findByOrderId(String orderId);
    List<Review> findByDriverId(Integer driverId);
}