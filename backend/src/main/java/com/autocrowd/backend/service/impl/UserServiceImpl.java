package com.autocrowd.backend.service.impl;

import java.math.BigDecimal;

import com.autocrowd.backend.dto.user.LoginRequest;
import com.autocrowd.backend.dto.user.RegisterRequest;
import com.autocrowd.backend.dto.user.UserProfileDTO;
import com.autocrowd.backend.dto.user.UserProfileUpdateRequest;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import com.autocrowd.backend.service.UserService;
import com.autocrowd.backend.entity.User;
import com.autocrowd.backend.repository.UserRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import com.autocrowd.backend.exception.ExceptionCodeEnum;
import com.autocrowd.backend.exception.BusinessException;
import com.autocrowd.backend.util.PasswordEncoderUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * 用户服务实现类
 * 处理用户注册、登录、资料查询和更新等核心业务逻辑
 * 作为业务逻辑层，实现UserService接口定义的所有功能
 */
@Service
@AllArgsConstructor
public class UserServiceImpl implements UserService {
    
    private static final Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);

    private final UserRepository userRepository;
    /**
     * 用户注册业务逻辑实现
     * 验证用户注册信息，检查用户名和手机号唯一性，创建新用户账户
     * @param registerRequest 注册请求DTO，包含用户注册所需信息
     * @return 包含新创建用户基本信息的DTO
     * @throws BusinessException 当用户名或手机号已存在时抛出
     */
    @Override
    public UserProfileDTO register(RegisterRequest registerRequest) {
        logger.info("[Service] 处理用户注册请求: {}", registerRequest);
        logger.info("[Service] 检查用户名是否存在: {}", registerRequest.getUsername());
        // Check if username already exists
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new BusinessException(ExceptionCodeEnum.USERNAME_ALREADY_EXISTS);
        }

        // Check if phone already exists
        logger.info("[Service] 检查手机号是否存在: {}", registerRequest.getPhone());
        if (userRepository.existsByPhone(registerRequest.getPhone())) {
            throw new BusinessException(ExceptionCodeEnum.PHONE_ALREADY_EXISTS);
        }

        // Create new user
        logger.info("[Service] 创建新用户");
        User user = new User();
        user.setUsername(registerRequest.getUsername());
        user.setPhone(registerRequest.getPhone());
        user.setPassword(PasswordEncoderUtil.encode(registerRequest.getPassword())); // 加密密码
        user.setCreditScore(100); // 默认信用分
        user.setBalance(BigDecimal.ZERO); // 默认余额为0
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);
        logger.info("[Service] 用户注册成功: {}", savedUser.getUsername());

        UserProfileDTO profileDTO = new UserProfileDTO();
        profileDTO.setUserId(savedUser.getUserId());
        profileDTO.setUsername(savedUser.getUsername());
        profileDTO.setPhone(savedUser.getPhone());
        profileDTO.setCreditScore(savedUser.getCreditScore());
        profileDTO.setBalance(savedUser.getBalance());
        return profileDTO;
    }

    /**
     * 用户登录业务逻辑实现
     * 根据用户名/手机号和密码查询用户，验证身份并返回用户基本信息
     * @param loginRequest 登录请求DTO，包含用户名/手机号和密码
     * @return 包含用户基本信息的DTO
     * @throws BusinessException 当用户不存在或密码错误时抛出
     */
    @Override
    public UserProfileDTO login(LoginRequest loginRequest) {
        logger.info("[UserServiceImpl] 处理用户登录请求: {}", loginRequest);
        try {
            User user = null;
            
            // 尝试使用用户名登录
            if (loginRequest.getUsername() != null && !loginRequest.getUsername().trim().isEmpty()) {
                logger.info("[UserServiceImpl] 尝试使用用户名登录: {}", loginRequest.getUsername());
                user = userRepository.findByUsername(loginRequest.getUsername())
                        .orElseThrow(() -> new BusinessException(ExceptionCodeEnum.USER_NOT_FOUND, "用户不存在"));
                
                // 验证密码
                if (!PasswordEncoderUtil.matches(loginRequest.getPassword(), user.getPassword())) {
                    throw new BusinessException(ExceptionCodeEnum.INVALID_PASSWORD, "用户名或密码错误");
                }
            } 
            // 尝试使用手机号登录
            else if (loginRequest.getPhone() != null && !loginRequest.getPhone().trim().isEmpty()) {
                logger.info("[UserServiceImpl] 尝试使用手机号登录: {}", loginRequest.getPhone());
                user = userRepository.findByPhone(loginRequest.getPhone())
                        .orElseThrow(() -> new BusinessException(ExceptionCodeEnum.USER_NOT_FOUND, "用户不存在"));
                
                // 验证密码
                if (!PasswordEncoderUtil.matches(loginRequest.getPassword(), user.getPassword())) {
                    throw new BusinessException(ExceptionCodeEnum.INVALID_PASSWORD, "手机号或密码错误");
                }
            } else {
                throw new BusinessException(ExceptionCodeEnum.PARAM_ERROR, "用户名或手机号不能为空");
            }

            logger.info("[UserServiceImpl] 登录成功: {}", user.getUsername());
            UserProfileDTO profileDTO = new UserProfileDTO();
            profileDTO.setUserId(user.getUserId());
            profileDTO.setUsername(user.getUsername());
            profileDTO.setPhone(user.getPhone());
            profileDTO.setCreditScore(user.getCreditScore());
            profileDTO.setBalance(user.getBalance());
            return profileDTO;
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            throw new BusinessException(ExceptionCodeEnum.LOGIN_FAILED, "用户登录异常: " + e.getMessage());
        }
    }

    /**
     * 获取用户个人资料业务逻辑实现
     * 根据用户ID查询用户完整信息，并转换为DTO返回
     * @param userId 用户ID
     * @return 包含用户完整信息的DTO
     * @throws BusinessException 当用户不存在时抛出
     */
    @Override
    public UserProfileDTO getUserProfile(Integer userId) {
        logger.info("[UserServiceImpl] 处理获取用户资料请求: userId = {}", userId);
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new BusinessException(ExceptionCodeEnum.USER_NOT_FOUND, "用户不存在"));

            UserProfileDTO profileDTO = new UserProfileDTO();
            profileDTO.setUserId(user.getUserId());
            profileDTO.setUsername(user.getUsername());
            profileDTO.setPhone(user.getPhone());
            profileDTO.setCreditScore(user.getCreditScore());
            profileDTO.setBalance(user.getBalance());
            logger.info("[UserServiceImpl] 获取用户资料成功: {}", user.getUsername());
            return profileDTO;
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            throw new BusinessException(ExceptionCodeEnum.USER_NOT_FOUND, "获取用户资料异常: " + e.getMessage());
        }
    }

    /**
     * 更新用户个人资料业务逻辑实现
     * 根据用户ID更新用户信息，并返回更新后的资料
     * @param userId 用户ID
     * @param profileUpdateRequest 个人资料更新请求DTO
     * @return 更新后的用户个人资料响应DTO
     * @throws BusinessException 当用户不存在或更新失败时抛出
     */
    @Override
    public UserProfileDTO updateUserProfile(Integer userId, UserProfileUpdateRequest profileUpdateRequest) {
        logger.info("[UserServiceImpl] 处理更新用户资料请求: userId = {}, request = {}", userId, profileUpdateRequest);
        try {
            // 获取用户实体
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new BusinessException(ExceptionCodeEnum.USER_NOT_FOUND, "用户不存在"));

            // 更新用户信息
            if (profileUpdateRequest.getUsername() != null && !profileUpdateRequest.getUsername().trim().isEmpty()) {
                // 检查用户名是否已存在
                if (!profileUpdateRequest.getUsername().equals(user.getUsername()) && 
                    userRepository.existsByUsername(profileUpdateRequest.getUsername())) {
                    throw new BusinessException(ExceptionCodeEnum.USERNAME_ALREADY_EXISTS, "用户名已存在");
                }
                user.setUsername(profileUpdateRequest.getUsername().trim());
            }
            
            if (profileUpdateRequest.getPhone() != null && !profileUpdateRequest.getPhone().trim().isEmpty()) {
                // 检查手机号是否已存在
                if (!profileUpdateRequest.getPhone().equals(user.getPhone()) && 
                    userRepository.existsByPhone(profileUpdateRequest.getPhone())) {
                    throw new BusinessException(ExceptionCodeEnum.PHONE_ALREADY_EXISTS, "手机号已存在");
                }
                user.setPhone(profileUpdateRequest.getPhone().trim());
            }
            
            if (profileUpdateRequest.getCreditScore() != null) {
                user.setCreditScore(profileUpdateRequest.getCreditScore());
            }
            
            if (profileUpdateRequest.getBalance() != null) {
                user.setBalance(profileUpdateRequest.getBalance());
            }
            
            user.setUpdatedAt(LocalDateTime.now());

            // 保存到数据库
            User updatedUser = userRepository.save(user);
            logger.info("[UserServiceImpl] 更新用户资料成功: {}", updatedUser.getUsername());

            // 转换为DTO并返回
            UserProfileDTO profileDTO = new UserProfileDTO();
            profileDTO.setUserId(updatedUser.getUserId());
            profileDTO.setUsername(updatedUser.getUsername());
            profileDTO.setPhone(updatedUser.getPhone());
            profileDTO.setCreditScore(updatedUser.getCreditScore());
            profileDTO.setBalance(updatedUser.getBalance());
            return profileDTO;
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            throw new BusinessException(ExceptionCodeEnum.PROFILE_UPDATE_FAILED, "更新用户资料异常: " + e.getMessage());
        }
    }
}