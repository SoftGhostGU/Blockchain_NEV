package com.autocrowd.backend.service.impl;

import com.autocrowd.backend.dto.RegisterRequest;
import java.math.BigDecimal;
import com.autocrowd.backend.dto.LoginRequest;


import com.autocrowd.backend.dto.UserProfileUpdateRequest;

import lombok.AllArgsConstructor;


import org.springframework.stereotype.Service;
import com.autocrowd.backend.service.UserService;


import com.autocrowd.backend.entity.User;
import com.autocrowd.backend.repository.UserRepository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import com.autocrowd.backend.exception.ExceptionCodeEnum;
import com.autocrowd.backend.exception.BusinessException;
import com.autocrowd.backend.dto.UserProfileDTO;

/**
 * 用户服务实现类
 * 处理用户注册、登录、资料查询和更新等核心业务逻辑
 * 作为业务逻辑层，实现UserService接口定义的所有功能
 */
@Service
@AllArgsConstructor
public class UserServiceImpl implements UserService {

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
        System.out.println("[Service] 处理用户注册请求: " + registerRequest);
        System.out.println("[Service] 检查用户名是否存在: " + registerRequest.getUsername());
        // Check if username already exists
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new BusinessException(ExceptionCodeEnum.USERNAME_ALREADY_EXISTS);
        }

        System.out.println("[Service] 检查手机号是否存在: " + registerRequest.getPhone());
        // Check if phone number already exists
        if (userRepository.existsByPhone(registerRequest.getPhone())) {
            throw new BusinessException(ExceptionCodeEnum.PHONE_ALREADY_EXISTS);
        }

        // Create new user
        System.out.println("[Service] 开始创建新用户对象");
        User user = new User();
        user.setUsername(registerRequest.getUsername());
        user.setPassword(registerRequest.getPassword());
        user.setPhone(registerRequest.getPhone());
        user.setCreditScore(100); // Default credit score
        user.setBalance(BigDecimal.valueOf(0.00));    // Default balance
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        // Save user to database
        System.out.println("[Service] 保存用户到数据库: " + user);
        User savedUser = userRepository.save(user);
        System.out.println("[Service] 用户保存成功，生成的用户ID: " + savedUser.getUserId());
        System.out.println("[Service] 用户保存成功: " + savedUser);

        return new UserProfileDTO(savedUser.getUserId(), savedUser.getUsername(), savedUser.getPhone(), savedUser.getBalance(), savedUser.getCreditScore());
    }

    /**
     * 用户登录业务逻辑实现
     * 根据手机号查询用户，验证密码，返回用户基本信息
     * @param loginRequest 登录请求DTO，包含手机号和密码
     * @return 包含用户基本信息的DTO
     * @throws BusinessException 当用户不存在或密码错误时抛出
     */
    @Override
    public UserProfileDTO login(LoginRequest loginRequest) {
        System.out.println("[Service] 处理用户登录请求: " + loginRequest);
        // Find user by phone
        System.out.println("[Service] 根据手机号查询用户: " + loginRequest.getPhone());
        User user = userRepository.findByPhone(loginRequest.getPhone())
            .orElseThrow(() -> new BusinessException(ExceptionCodeEnum.USER_NOT_FOUND));

        // Verify password (Note: In a real application, you should use password hashing and comparison)
        if (!user.getPassword().equals(loginRequest.getPassword())) {
            throw new BusinessException(ExceptionCodeEnum.INVALID_PASSWORD);
        }

        UserProfileDTO result = new UserProfileDTO(user.getUserId(), user.getUsername(), user.getPhone(), user.getBalance(), user.getCreditScore());
        System.out.println("[Service] 登录成功，返回结果: " + result);
        return result;
    }

    /**
     * 获取用户资料业务逻辑实现
     * 根据用户ID查询用户完整信息，并转换为DTO返回
     * @param userId 用户ID
     * @return 包含用户详细资料的DTO
     * @throws BusinessException 当用户不存在时抛出
     */
    @Override
    public UserProfileDTO getUserProfile(Integer userId) {
        System.out.println("[Service] 获取用户资料，用户ID: " + userId);
        System.out.println("[Service] 根据ID查询用户: " + userId);
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new BusinessException(ExceptionCodeEnum.USER_NOT_FOUND));
        
        UserProfileDTO profileDTO = new UserProfileDTO(user.getUserId(), user.getUsername(), user.getPhone(), user.getBalance(), user.getCreditScore());
        
        System.out.println("[Service] 返回用户资料: " + profileDTO);
        return profileDTO;
    }

    /**
     * 更新用户资料业务逻辑实现
     * 根据用户ID查询用户，更新指定的用户信息字段，保存并返回更新结果
     * @param userId 用户ID
     * @param profileUpdateRequest 资料更新请求DTO，包含需要更新的字段
     * @return 包含更新后用户资料的DTO
     * @throws BusinessException 当用户不存在时抛出
     */
    @Override
    public UserProfileDTO updateUserProfile(Integer userId, UserProfileUpdateRequest profileUpdateRequest) {
        System.out.println("[Service] 更新用户资料，用户ID: " + userId + ", 请求数据: " + profileUpdateRequest);
        System.out.println("[Service] 根据ID查询用户: " + userId);
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new BusinessException(ExceptionCodeEnum.USER_NOT_FOUND));
        
        if (profileUpdateRequest.getUsername() != null) {
            user.setUsername(profileUpdateRequest.getUsername());
        }
        if (profileUpdateRequest.getPhone() != null) {
            user.setPhone(profileUpdateRequest.getPhone());
        }
        if (profileUpdateRequest.getCreditScore() != null) {
            user.setCreditScore(profileUpdateRequest.getCreditScore());
        }
        if (profileUpdateRequest.getBalance() != null) {
            user.setBalance(profileUpdateRequest.getBalance());
        }
        
        user.setUpdatedAt(LocalDateTime.now());
        System.out.println("[Service] 更新用户信息: " + user);
        User updatedUser = userRepository.save(user);
        System.out.println("[Service] 用户资料更新成功，用户ID: " + updatedUser.getUserId());
        System.out.println("[Service] 用户更新成功: " + updatedUser);
        
        UserProfileDTO responseDTO = new UserProfileDTO(
            updatedUser.getUserId(),
            updatedUser.getUsername(),
            updatedUser.getPhone(),
            updatedUser.getBalance(),
            updatedUser.getCreditScore()
        );
        
        System.out.println("[Service] 用户资料更新成功，返回结果: " + responseDTO);
        return responseDTO;
    }


}