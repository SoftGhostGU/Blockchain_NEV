package com.autocrowd.backend.dto.driver;

import lombok.Data;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * 司机注册请求DTO
 */
@Data
public class DriverRegisterRequest {
    @NotBlank(message = "用户名不能为空")
    @Size(min = 3, max = 20, message = "用户名长度必须在3-20个字符之间")
    private String username;

    @NotBlank(message = "密码不能为空")
    @Pattern(regexp = "^[a-zA-Z0-9]{6,18}$", message = "密码必须是6-18位字母或数字")
    private String password;

    @NotBlank(message = "手机号不能为空")
    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "手机号格式不正确")
    private String phone;

    private String bankCard;

    @NotBlank(message = "车辆类型不能为空")
    private String vehicleType;

    @NotBlank(message = "车牌号不能为空")
    private String licensePlate;
}