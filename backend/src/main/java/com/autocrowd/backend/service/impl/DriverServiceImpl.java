package com.autocrowd.backend.service.impl;

import com.autocrowd.backend.dto.*;
import com.autocrowd.backend.entity.Driver;
import com.autocrowd.backend.exception.BusinessException;
import com.autocrowd.backend.exception.ExceptionCodeEnum;
import com.autocrowd.backend.repository.DriverRepository;
import com.autocrowd.backend.service.DriverService;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class DriverServiceImpl implements DriverService {

    private final DriverRepository driverRepository;

    @Override
    public DriverProfileDTO login(DriverLoginRequest loginRequest) {
        System.out.println("[DriverServiceImpl] 处理车主登录请求: " + loginRequest);
        try {
            Driver driver = driverRepository.findByPhoneAndPasswordWithLog(loginRequest.getPhone(), loginRequest.getPassword())
                    .orElseThrow(() -> new BusinessException(ExceptionCodeEnum.DRIVER_NOT_FOUND, "司机不存在或密码错误"));

            DriverProfileDTO profileDTO = new DriverProfileDTO();
            profileDTO.setUserId(driver.getDriverId());
            profileDTO.setUsername(driver.getUsername());
            profileDTO.setCreditScore(driver.getCreditScore());
            profileDTO.setWalletBalance(driver.getWalletBalance());
            System.out.println("[DriverServiceImpl] 车主登录成功: " + driver.getUsername());
            return profileDTO;
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            throw new BusinessException(ExceptionCodeEnum.DRIVER_LOGIN_ERROR, "司机登录异常: " + e.getMessage());
        }
    }

    @Override
    public DriverProfileDTO getDriverProfile(Integer driverId) {
        System.out.println("[DriverServiceImpl] 获取司机资料: driverId=" + driverId);
        try {
            Driver driver = driverRepository.findById(driverId)
                    .orElseThrow(() -> new BusinessException(ExceptionCodeEnum.DRIVER_NOT_FOUND, "司机不存在"));

            DriverProfileDTO profileDTO = new DriverProfileDTO();
            profileDTO.setUserId(driver.getDriverId());
            profileDTO.setUsername(driver.getUsername());
            profileDTO.setPhone(driver.getPhone());
            profileDTO.setCreditScore(driver.getCreditScore());
            profileDTO.setWalletBalance(driver.getWalletBalance());
            
            System.out.println("[DriverServiceImpl] 获取司机资料成功: " + driver.getUsername());
            return profileDTO;
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            throw new BusinessException(ExceptionCodeEnum.DRIVER_PROFILE_GET_ERROR, "获取司机资料异常: " + e.getMessage());
        }
    }

    @Override
    public DriverProfileDTO updateDriverProfile(Integer driverId, DriverProfileUpdateRequest profileUpdateRequest) {
        System.out.println("[DriverServiceImpl] 更新司机资料: driverId=" + driverId + ", request=" + profileUpdateRequest);
        try {
            Driver driver = driverRepository.findById(driverId)
                    .orElseThrow(() -> new BusinessException(ExceptionCodeEnum.DRIVER_NOT_FOUND, "司机不存在"));

            // 更新司机信息
            if (profileUpdateRequest.getPhone() != null) {
                // 检查手机号是否已被其他司机使用
                if (driverRepository.existsByPhoneWithLog(profileUpdateRequest.getPhone()) && 
                    !driver.getPhone().equals(profileUpdateRequest.getPhone())) {
                    throw new BusinessException(ExceptionCodeEnum.PHONE_ALREADY_REGISTERED, "手机号已被注册");
                }
                driver.setPhone(profileUpdateRequest.getPhone());
            }


            driver.setUpdatedAt(LocalDateTime.now());
            Driver updatedDriver = driverRepository.save(driver);

            // 构建并返回更新后的司机资料DTO
            DriverProfileDTO profileDTO = new DriverProfileDTO();
            profileDTO.setUserId(updatedDriver.getDriverId());
            profileDTO.setUsername(updatedDriver.getUsername());
            profileDTO.setPhone(updatedDriver.getPhone());
            profileDTO.setCreditScore(updatedDriver.getCreditScore());
            profileDTO.setWalletBalance(updatedDriver.getWalletBalance());

            System.out.println("[DriverServiceImpl] 司机资料更新成功: " + updatedDriver.getUsername());
            return profileDTO;
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            throw new BusinessException(ExceptionCodeEnum.DRIVER_PROFILE_UPDATE_ERROR, "司机资料更新异常: " + e.getMessage());
        }
    }

    @Override
    public DriverProfileDTO register(DriverRegisterRequest registerRequest) {
        System.out.println("[DriverServiceImpl] 处理司机注册请求: " + registerRequest);
        try {
            // 检查用户名是否已存在
            if (driverRepository.existsByUsernameWithLog(registerRequest.getUsername())) {
                throw new BusinessException(ExceptionCodeEnum.DRIVERNAME_ALREADY_EXISTS, "用户名已注册");
            }

            // 检查手机号是否已注册
            if (driverRepository.existsByPhoneWithLog(registerRequest.getPhone())) {
                throw new BusinessException(ExceptionCodeEnum.PHONE_ALREADY_REGISTERED, "手机号已注册");
            }

            // 创建新司机
            Driver driver = new Driver();
            driver.setUsername(registerRequest.getUsername());
            driver.setPassword(registerRequest.getPassword());
            driver.setPhone(registerRequest.getPhone());
            driver.setCreditScore(100); // 默认信用分数
            driver.setWalletBalance(BigDecimal.valueOf(0.00)); // 默认余额
            driver.setCreatedAt(LocalDateTime.now());
            driver.setUpdatedAt(LocalDateTime.now());

            // 保存司机到数据库
            Driver savedDriver = driverRepository.save(driver);

            DriverProfileDTO profileDTO = new DriverProfileDTO();
            profileDTO.setUserId(savedDriver.getDriverId());
            profileDTO.setUsername(savedDriver.getUsername());
            profileDTO.setCreditScore(savedDriver.getCreditScore());
            profileDTO.setWalletBalance(savedDriver.getWalletBalance());
            System.out.println("[DriverServiceImpl] 司机注册成功: " + savedDriver.getUsername());
            return profileDTO;
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            throw new BusinessException(ExceptionCodeEnum.DRIVER_REGISTER_FAILED, "司机注册异常: " + e.getMessage());
        }
    }
}