package com.autocrowd.backend.dto.user;

import lombok.Data;
import java.math.BigDecimal;

/**
 * 用户个人资料更新请求DTO
 */
@Data
public class UserProfileUpdateRequest {
    private String username;
    private String phone;
    private Integer creditScore;
    private BigDecimal balance;
}