package com.autocrowd.backend.service;

import com.autocrowd.backend.dto.DriverLoginRequest;
import com.autocrowd.backend.dto.DriverProfileDTO;
import com.autocrowd.backend.dto.DriverProfileUpdateRequest;
import com.autocrowd.backend.dto.DriverRegisterRequest;

/**
 * 车主服务接口，定义车主相关业务逻辑
 */
public interface DriverService {

    /**
     * 车主登录
     * @param loginRequest 登录请求DTO
     * @return 车主信息DTO
     */
    DriverProfileDTO login(DriverLoginRequest loginRequest);

    /**
     * 获取车主资料
     * @param driverId 车主ID
     * @return 车主资料DTO
     */
    DriverProfileDTO getDriverProfile(Integer driverId);

    /**
     * 更新车主资料
     * @param driverId 车主ID
     * @param profileUpdateRequest 资料更新请求DTO
     * @return 更新后的车主资料DTO
     */
    DriverProfileDTO updateDriverProfile(Integer driverId, DriverProfileUpdateRequest profileUpdateRequest);

    /**
     * 车主注册
     * @param registerRequest 注册请求DTO
     * @return 注册成功的车主信息DTO
     */
    DriverProfileDTO register(DriverRegisterRequest registerRequest);
}