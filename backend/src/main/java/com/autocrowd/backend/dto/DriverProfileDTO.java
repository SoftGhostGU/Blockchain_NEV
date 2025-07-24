package com.autocrowd.backend.dto;

import java.math.BigDecimal;
import lombok.Data;

@Data
public class DriverProfileDTO {
    private Integer userId;
    private String username;
    private Integer creditScore;
    private BigDecimal walletBalance;
    private String phone;
}