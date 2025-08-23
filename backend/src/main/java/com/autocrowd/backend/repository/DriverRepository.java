package com.autocrowd.backend.repository;

import com.autocrowd.backend.entity.Driver;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DriverRepository extends JpaRepository<Driver, Integer> {
    Logger logger = LoggerFactory.getLogger(DriverRepository.class);
    
    Optional<Driver> findByUsername(String username);
    default Optional<Driver> findByUsernameWithLog(String username) {
        logger.debug("DriverRepository: 查询用户名 - {}", username);
        return findByUsername(username);
    }
    boolean existsByUsername(String username);
    default boolean existsByUsernameWithLog(String username) {
        logger.debug("DriverRepository: 检查用户名是否存在 - {}", username);
        return existsByUsername(username);
    }
    boolean existsByPhone(String phone);
    default boolean existsByPhoneWithLog(String phone) {
        logger.debug("DriverRepository: 检查手机号是否存在 - {}", phone);
        return existsByPhone(phone);
    }
    Optional<Driver> findByPhone(String phone);
    default Optional<Driver> findByPhoneWithLog(String phone) {
        logger.debug("DriverRepository: 查询手机号 - {}", phone);
        return findByPhone(phone);
    }
}