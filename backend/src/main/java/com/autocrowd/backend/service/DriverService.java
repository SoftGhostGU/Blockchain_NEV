package com.autocrowd.backend.service;

import com.autocrowd.backend.dto.driver.*;

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
     * @return 车主信息DTO
     */
    DriverProfileDTO getDriverProfile(Integer driverId);

    /**
     * 更新车主资料
     * @param driverId 车主ID
     * @param profileUpdateRequest 资料更新请求DTO
     * @return 更新后的车主信息DTO
     */
    DriverProfileDTO updateDriverProfile(Integer driverId, DriverProfileUpdateRequest profileUpdateRequest);

    /**
     * 车主注册
     * @param registerRequest 注册请求DTO
     * @return 新注册的车主信息DTO
     */
    DriverProfileDTO register(DriverRegisterRequest registerRequest);

    /**
     * 更新车主银行卡号
     * @param driverId 车主ID
     * @param request 银行卡号更新请求
     * @return 更新后的车主信息
     */
    DriverProfileDTO updateBankCard(Integer driverId, UpdateBankCardRequest request);
}