package com.autocrowd.backend.dto.user;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

/**
 * 用户资料DTO，包含用户所有公开信息
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDTO {
    private Integer userId;
    private String username;
    private String phone;
    private BigDecimal balance;
    private Integer creditScore;
}