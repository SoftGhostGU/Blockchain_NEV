package com.autocrowd.backend.dto;

import lombok.Data;

import jakarta.validation.constraints.NotBlank;

/**
 * 司机登录请求DTO
 */
@Data
public class DriverLoginRequest {
    @NotBlank(message = "手机号不能为空")
    private String phone;

    @NotBlank(message = "密码不能为空")
    private String password;
}