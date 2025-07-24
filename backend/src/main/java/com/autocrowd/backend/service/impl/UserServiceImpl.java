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
 * 用户服务实现类，处理登录注册业务逻辑
 */
@Service
@AllArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
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
        System.out.println("[Service] 用户保存成功: " + savedUser);

        return new UserProfileDTO(savedUser.getUserId(), savedUser.getUsername(), savedUser.getPhone(), savedUser.getBalance(), savedUser.getCreditScore());
    }

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