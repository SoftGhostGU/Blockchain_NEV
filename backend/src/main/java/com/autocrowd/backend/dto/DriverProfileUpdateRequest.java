package com.autocrowd.backend.dto;

import lombok.Data;

import java.math.BigDecimal;

/**
 * 车主资料更新请求DTO
 */
@Data
public class DriverProfileUpdateRequest {
    private String username;
    private String phone;
    private Integer creditScore;
    private BigDecimal walletBalance;
    private String bankCard;

}