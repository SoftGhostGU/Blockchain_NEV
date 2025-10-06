package com.autocrowd.backend.service.impl;

import com.autocrowd.backend.dto.driver.DriverLoginRequest;
import com.autocrowd.backend.dto.driver.DriverProfileDTO;
import com.autocrowd.backend.dto.driver.DriverProfileUpdateRequest;
import com.autocrowd.backend.dto.driver.DriverRegisterRequest;
import com.autocrowd.backend.dto.driver.UpdateBankCardRequest;
import com.autocrowd.backend.entity.Driver;
import com.autocrowd.backend.entity.Financial;
import com.autocrowd.backend.entity.Vehicle;
import com.autocrowd.backend.exception.ExceptionCodeEnum;
import com.autocrowd.backend.exception.BusinessException;
import com.autocrowd.backend.repository.DriverRepository;
import com.autocrowd.backend.repository.VehicleRepository;
import com.autocrowd.backend.service.BlockchainService;
import com.autocrowd.backend.service.DriverService;
import com.autocrowd.backend.util.PasswordEncoderUtil;
import com.autocrowd.backend.util.PasswordValidatorUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class DriverServiceImpl implements DriverService {
    
    private static final Logger logger = LoggerFactory.getLogger(DriverServiceImpl.class);
    
    @Autowired
    private DriverRepository driverRepository;
    
    @Autowired
    private VehicleRepository vehicleRepository;
    
    @Autowired
    private BlockchainService blockchainService;
    
    /**
     * 将Driver实体转换为DriverProfileDTO
     * @param driver Driver实体
     * @return DriverProfileDTO对象
     */
    private DriverProfileDTO convertToDTO(Driver driver) {
        DriverProfileDTO profileDTO = new DriverProfileDTO();
        profileDTO.setUserId(driver.getDriverId());
        profileDTO.setUsername(driver.getUsername());
        profileDTO.setCreditScore(driver.getCreditScore());
        profileDTO.setWalletBalance(driver.getWalletBalance());
        profileDTO.setPhone(driver.getPhone());
        profileDTO.setBankCard(driver.getBankCard());
        profileDTO.setCreatedAt(driver.getCreatedAt());
        profileDTO.setUpdatedAt(driver.getUpdatedAt());
        
        // 查找司机关联的车辆
        List<Vehicle> vehicles = vehicleRepository.findByDriverId(driver.getDriverId());
        if (!vehicles.isEmpty()) {
            profileDTO.setVehicleId(vehicles.get(0).getVehicleId());
        }
        
        return profileDTO;
    }
    
    /**
     * 司机登录业务逻辑实现
     * 根据手机号和密码查询司机，验证身份并返回司机基本信息
     * @param loginRequest 登录请求DTO，包含手机号和密码
     * @return 包含司机基本信息的DTO
     * @throws BusinessException 当司机不存在或密码错误时抛出
     */
    @Override
    public DriverProfileDTO login(DriverLoginRequest loginRequest) {
        String phone = loginRequest.getPhone();
        String rawPassword = loginRequest.getPassword();
        logger.info("[DriverService] 车主登录 - 手机号: {}", phone);

        // 检查手机号是否存在
        Optional<Driver> driverOpt = driverRepository.findByPhone(phone);
        if (!driverOpt.isPresent()) {
            logger.warn("[DriverService] 车主登录失败 - 手机号不存在: {}", phone);
            throw new BusinessException(ExceptionCodeEnum.USER_NOT_FOUND, "手机号不存在");
        }
        Driver driver = driverOpt.get();

        // 验证密码
        if (!PasswordEncoderUtil.matches(rawPassword, driver.getPassword())) {
            logger.warn("[DriverService] 车主登录失败 - 密码错误: 手机号={}", phone);
            throw new BusinessException(ExceptionCodeEnum.INVALID_PASSWORD, "密码错误");
        }

        logger.info("[DriverService] 车主登录成功 - 司机ID: {}, 用户名: {}", driver.getDriverId(), driver.getUsername());
        return convertToDTO(driver);
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

            logger.info("[DriverServiceImpl] 获取车主资料成功: {}", driver.getUsername());
            return convertToDTO(driver);
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

            BigDecimal oldWalletBalance = driver.getWalletBalance();

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

            // ///////////////////////////////////////////////////////////////////////
            // 根据需求，如果不对数据库里面的financial进行更改，不用将更改同步到区块链
            // ///////////////////////////////////////////////////////////////////////
            // 如果余额有变更，同步到区块链
            if (profileUpdateRequest.getWalletBalance() != null && 
                (oldWalletBalance == null || oldWalletBalance.compareTo(profileUpdateRequest.getWalletBalance()) != 0)) {
                Financial driverFinancial = new Financial();
                // 生成财务记录ID（可使用UUID或数据库自增ID）
                // driverFinancial.setFinancialId(UUID.randomUUID().toString());
                driverFinancial.setUserId(driverId);
                driverFinancial.setRole("driver");
                driverFinancial.setTransactionType(Financial.TransactionType.Withdrawal);
                driverFinancial.setAmount(profileUpdateRequest.getWalletBalance());
                // 设置当前余额（如果需要）
                // driverFinancial.setBalance(updatedDriver.getWalletBalance());
                driverFinancial.setTransactionTime(LocalDateTime.now());
                blockchainService.createDriverTransactionOnBlockchain(driverFinancial);
            }

            // 转换为DTO并返回
            return convertToDTO(updatedDriver);
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

            // 验证密码强度
            PasswordValidatorUtil.validatePassword(registerRequest.getPassword());

            // 创建新车主
            logger.info("[DriverServiceImpl] 创建新车主");
            Driver driver = new Driver();
            driver.setUsername(registerRequest.getUsername());
            driver.setPhone(registerRequest.getPhone());
            driver.setPassword(PasswordEncoderUtil.encode(registerRequest.getPassword()));
            driver.setCreditScore(100); // 默认信用分为100
            driver.setWalletBalance(BigDecimal.ZERO); // 默认钱包余额为0
            driver.setCreatedAt(LocalDateTime.now());
            driver.setUpdatedAt(LocalDateTime.now());

            Driver savedDriver = driverRepository.save(driver);
            logger.info("[DriverServiceImpl] 车主注册成功: {}", savedDriver.getUsername());

            return convertToDTO(savedDriver);
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            throw new BusinessException(ExceptionCodeEnum.DRIVER_REGISTER_ERROR, "车主注册异常: " + e.getMessage());
        }
    }

    /**
     * 更新车主银行卡号业务逻辑实现
     * @param driverId 车主ID
     * @param request 银行卡号更新请求
     * @return 更新后的车主信息
     */
    @Override
    public DriverProfileDTO updateBankCard(Integer driverId, UpdateBankCardRequest request) {
        logger.info("[DriverServiceImpl] 处理更新车主银行卡号请求: driverId = {}, bankCard = {}", driverId, request.getBankCard());
        try {
            // 获取车主实体
            Driver driver = driverRepository.findById(driverId)
                    .orElseThrow(() -> new BusinessException(ExceptionCodeEnum.DRIVER_NOT_FOUND, "车主不存在"));

            // 更新银行卡号
            driver.setBankCard(request.getBankCard());
            driver.setUpdatedAt(LocalDateTime.now());

            // 保存到数据库
            Driver updatedDriver = driverRepository.save(driver);
            logger.info("[DriverServiceImpl] 更新车主银行卡号成功: {}", updatedDriver.getUsername());

            return convertToDTO(updatedDriver);
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            throw new BusinessException(ExceptionCodeEnum.DRIVER_PROFILE_UPDATE_ERROR, "更新车主银行卡号异常: " + e.getMessage());
        }
    }
}