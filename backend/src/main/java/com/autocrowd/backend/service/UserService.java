package com.autocrowd.backend.service;
import com.autocrowd.backend.dto.LoginRequest;
import com.autocrowd.backend.dto.RegisterRequest;
import com.autocrowd.backend.dto.UserProfileDTO;

import com.autocrowd.backend.dto.UserProfileUpdateRequest;

/**
 * 用户服务接口，定义用户认证和个人资料相关方法
 */
public interface UserService {

    UserProfileDTO register(RegisterRequest registerRequest);

    UserProfileDTO login(LoginRequest loginRequest);

    /**
     * 获取用户个人资料
     * @param userId 用户ID
     * @return 用户个人资料响应DTO
     */
    UserProfileDTO getUserProfile(Integer userId);

    /**
     * 更新用户个人资料，包括余额和信誉分
     * @param userId 用户ID
     * @param profileUpdateRequest 个人资料更新请求DTO
     * @return 更新后的用户个人资料响应DTO
     */
    UserProfileDTO updateUserProfile(Integer userId, UserProfileUpdateRequest profileUpdateRequest);
}
    /**
     * 获取用户个人资料
     * @param userId 用户ID
     * @return 用户个人资料响应DTO
     */