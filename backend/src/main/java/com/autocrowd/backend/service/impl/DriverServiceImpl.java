package com.autocrowd.backend.service.impl;

import com.autocrowd.backend.dto.driver.DriverLoginRequest;
import com.autocrowd.backend.dto.driver.DriverProfileDTO;
import com.autocrowd.backend.dto.driver.DriverProfileUpdateRequest;
import com.autocrowd.backend.dto.driver.DriverRegisterRequest;
import com.autocrowd.backend.entity.Driver;
import com.autocrowd.backend.exception.BusinessException;
import com.autocrowd.backend.exception.ExceptionCodeEnum;
import com.autocrowd.backend.repository.DriverRepository;
import com.autocrowd.backend.service.DriverService;
import com.autocrowd.backend.util.PasswordEncoderUtil;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class DriverServiceImpl implements DriverService {
    
    private static final Logger logger = LoggerFactory.getLogger(DriverServiceImpl.class);

    private final DriverRepository driverRepository;

    /**
     * 司机登录业务逻辑实现
     * 根据手机号和密码查询司机，验证身份并返回司机基本信息
     * @param loginRequest 登录请求DTO，包含手机号和密码
     * @return 包含司机基本信息的DTO
     * @throws BusinessException 当司机不存在或密码错误时抛出
     */
    @Override
    public DriverProfileDTO login(DriverLoginRequest loginRequest) {
        logger.info("[DriverServiceImpl] 处理车主登录请求: {}", loginRequest);
        try {
            Driver driver = null;
            
            // 使用手机号登录
            if (loginRequest.getPhone() != null && !loginRequest.getPhone().trim().isEmpty()) {
                logger.info("[DriverServiceImpl] 尝试使用手机号登录: {}", loginRequest.getPhone());
                driver = driverRepository.findByPhone(loginRequest.getPhone())
                        .orElseThrow(() -> new BusinessException(ExceptionCodeEnum.DRIVER_NOT_FOUND, "司机不存在"));
                
                // 验证密码
                if (!PasswordEncoderUtil.matches(loginRequest.getPassword(), driver.getPassword())) {
                    throw new BusinessException(ExceptionCodeEnum.INVALID_PASSWORD, "手机号或密码错误");
                }
            } else {
                throw new BusinessException(ExceptionCodeEnum.PARAM_ERROR, "手机号不能为空");
            }

            DriverProfileDTO profileDTO = new DriverProfileDTO();
            profileDTO.setUserId(driver.getDriverId());
            profileDTO.setUsername(driver.getUsername());
            profileDTO.setCreditScore(driver.getCreditScore());
            profileDTO.setWalletBalance(driver.getWalletBalance());
            profileDTO.setPhone(driver.getPhone());
            profileDTO.setBankCard(driver.getBankCard());
            logger.info("[DriverServiceImpl] 车主登录成功: {}", driver.getUsername());
            return profileDTO;
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            throw new BusinessException(ExceptionCodeEnum.DRIVER_LOGIN_ERROR, "司机登录异常: " + e.getMessage());
        }
    }

    /**
     * 获取司机资料业务逻辑实现
     * 根据司机ID查询司机完整信息，并转换为DTO返回
     * @param driverId 司机ID
     * @return 包含司机完整信息的DTO
     * @throws BusinessException 当司机不存在时抛出
     */
    @Override
    public DriverProfileDTO getDriverProfile(Integer driverId) {
        logger.info("[DriverServiceImpl] 处理获取车主资料请求: driverId = {}", driverId);
        try {
            Driver driver = driverRepository.findById(driverId)
                    .orElseThrow(() -> new BusinessException(ExceptionCodeEnum.DRIVER_NOT_FOUND, "司机不存在"));

            DriverProfileDTO profileDTO = new DriverProfileDTO();
            profileDTO.setUserId(driver.getDriverId());
            profileDTO.setUsername(driver.getUsername());
            profileDTO.setCreditScore(driver.getCreditScore());
            profileDTO.setWalletBalance(driver.getWalletBalance());
            profileDTO.setPhone(driver.getPhone());
            profileDTO.setBankCard(driver.getBankCard());
            logger.info("[DriverServiceImpl] 获取车主资料成功: {}", driver.getUsername());
            return profileDTO;
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            throw new BusinessException(ExceptionCodeEnum.DRIVER_PROFILE_GET_ERROR, "获取司机资料异常: " + e.getMessage());
        }
    }

    /**
     * 更新司机资料业务逻辑实现
     * 根据司机ID更新司机信息，并返回更新后的资料
     * @param driverId 司机ID
     * @param profileUpdateRequest 资料更新请求DTO
     * @return 更新后的司机资料DTO
     * @throws BusinessException 当司机不存在或更新失败时抛出
     */
    @Override
    public DriverProfileDTO updateDriverProfile(Integer driverId, DriverProfileUpdateRequest profileUpdateRequest) {
        logger.info("[DriverServiceImpl] 处理更新车主资料请求: driverId = {}, request = {}", driverId, profileUpdateRequest);
        try {
            // 获取司机实体
            Driver driver = driverRepository.findById(driverId)
                    .orElseThrow(() -> new BusinessException(ExceptionCodeEnum.DRIVER_NOT_FOUND, "司机不存在"));

            // 更新司机信息
            if (profileUpdateRequest.getUsername() != null && !profileUpdateRequest.getUsername().trim().isEmpty()) {
                // 检查用户名是否已存在
                if (!profileUpdateRequest.getUsername().equals(driver.getUsername()) && 
                    driverRepository.existsByUsername(profileUpdateRequest.getUsername())) {
                    throw new BusinessException(ExceptionCodeEnum.USERNAME_ALREADY_EXISTS, "用户名已存在");
                }
                driver.setUsername(profileUpdateRequest.getUsername().trim());
            }
            
            if (profileUpdateRequest.getPhone() != null && !profileUpdateRequest.getPhone().trim().isEmpty()) {
                // 检查手机号是否已存在
                if (!profileUpdateRequest.getPhone().equals(driver.getPhone()) && 
                    driverRepository.existsByPhone(profileUpdateRequest.getPhone())) {
                    throw new BusinessException(ExceptionCodeEnum.PHONE_ALREADY_EXISTS, "手机号已存在");
                }
                driver.setPhone(profileUpdateRequest.getPhone().trim());
            }
            
            if (profileUpdateRequest.getCreditScore() != null) {
                driver.setCreditScore(profileUpdateRequest.getCreditScore());
            }
            
            if (profileUpdateRequest.getWalletBalance() != null) {
                driver.setWalletBalance(profileUpdateRequest.getWalletBalance());
            }
            
            if (profileUpdateRequest.getBankCard() != null && !profileUpdateRequest.getBankCard().trim().isEmpty()) {
                driver.setBankCard(profileUpdateRequest.getBankCard().trim());
            }
            
            driver.setUpdatedAt(LocalDateTime.now());

            // 保存到数据库
            Driver updatedDriver = driverRepository.save(driver);
            logger.info("[DriverServiceImpl] 更新车主资料成功: {}", updatedDriver.getUsername());

            // 转换为DTO并返回
            DriverProfileDTO profileDTO = new DriverProfileDTO();
            profileDTO.setUserId(updatedDriver.getDriverId());
            profileDTO.setUsername(updatedDriver.getUsername());
            profileDTO.setCreditScore(updatedDriver.getCreditScore());
            profileDTO.setWalletBalance(updatedDriver.getWalletBalance());
            profileDTO.setPhone(updatedDriver.getPhone());
            profileDTO.setBankCard(updatedDriver.getBankCard());
            return profileDTO;
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            throw new BusinessException(ExceptionCodeEnum.DRIVER_PROFILE_UPDATE_ERROR, "更新司机资料异常: " + e.getMessage());
        }
    }

    /**
     * 车主注册业务逻辑实现
     * 验证车主注册信息，检查用户名和手机号唯一性，创建新车主账户
     * @param registerRequest 注册请求DTO，包含车主注册所需信息
     * @return 包含新创建车主基本信息的DTO
     * @throws BusinessException 当用户名或手机号已存在时抛出
     */
    @Override
    public DriverProfileDTO register(DriverRegisterRequest registerRequest) {
        logger.info("[DriverServiceImpl] 处理车主注册请求: {}", registerRequest);
        try {
            // 检查用户名是否已存在
            if (driverRepository.existsByUsername(registerRequest.getUsername())) {
                throw new BusinessException(ExceptionCodeEnum.USERNAME_ALREADY_EXISTS);
            }

            // 检查手机号是否已存在
            if (driverRepository.existsByPhone(registerRequest.getPhone())) {
                throw new BusinessException(ExceptionCodeEnum.PHONE_ALREADY_EXISTS);
            }

            // 创建新司机
            Driver driver = new Driver();
            driver.setUsername(registerRequest.getUsername());
            driver.setPhone(registerRequest.getPhone());
            driver.setPassword(PasswordEncoderUtil.encode(registerRequest.getPassword())); // 加密密码
            driver.setCreditScore(100); // 默认信用分
            driver.setWalletBalance(BigDecimal.ZERO); // 默认余额为0
            driver.setBankCard(registerRequest.getBankCard());
            driver.setCreatedAt(LocalDateTime.now());
            driver.setUpdatedAt(LocalDateTime.now());

            // 保存到数据库
            Driver savedDriver = driverRepository.save(driver);
            logger.info("[DriverServiceImpl] 车主注册成功: {}", savedDriver.getUsername());

            // 转换为DTO并返回
            DriverProfileDTO profileDTO = new DriverProfileDTO();
            profileDTO.setUserId(savedDriver.getDriverId());
            profileDTO.setUsername(savedDriver.getUsername());
            profileDTO.setCreditScore(savedDriver.getCreditScore());
            profileDTO.setWalletBalance(savedDriver.getWalletBalance());
            profileDTO.setPhone(savedDriver.getPhone());
            profileDTO.setBankCard(savedDriver.getBankCard());
            return profileDTO;
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            throw new BusinessException(ExceptionCodeEnum.DRIVER_REGISTER_FAILED, "车主注册异常: " + e.getMessage());
        }
    }
}