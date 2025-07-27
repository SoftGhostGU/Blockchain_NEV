package com.autocrowd.backend.repository;

import com.autocrowd.backend.entity.Driver;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DriverRepository extends JpaRepository<Driver, Integer> {
    Optional<Driver> findByUsername(String username);
    default Optional<Driver> findByUsernameWithLog(String username) {
        System.out.println("DriverRepository: 查询用户名 - " + username);
        return findByUsername(username);
    }
    boolean existsByUsername(String username);
    default boolean existsByUsernameWithLog(String username) {
        System.out.println("DriverRepository: 检查用户名是否存在 - " + username);
        return existsByUsername(username);
    }
    boolean existsByPhone(String phone);
    default boolean existsByPhoneWithLog(String phone) {
        System.out.println("DriverRepository: 检查手机号是否存在 - " + phone);
        return existsByPhone(phone);
    }
    Optional<Driver> findByUsernameAndPassword(String username, String password);
    default Optional<Driver> findByUsernameAndPasswordWithLog(String username, String password) {
        System.out.println("DriverRepository: 用户名密码登录查询 - " + username);
        return findByUsernameAndPassword(username, password);
    }

    Optional<Driver> findByPhoneAndPassword(String phone, String password);
    default Optional<Driver> findByPhoneAndPasswordWithLog(String phone, String password) {
        System.out.println("DriverRepository: 手机号密码登录查询 - " + phone);
        return findByPhoneAndPassword(phone, password);
    }
}