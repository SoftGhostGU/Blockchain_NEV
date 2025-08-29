package com.autocrowd.backend.repository;

import com.autocrowd.backend.entity.Driver;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DriverRepository extends JpaRepository<Driver, Integer> {
    Optional<Driver> findByPhone(String phone);
    boolean existsByPhone(String phone);
    boolean existsByUsername(String username);
    Page<Driver> findByUsernameContaining(String username, Pageable pageable);
}