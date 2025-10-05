package com.autocrowd.backend.dto.financial;

import lombok.Data;
import java.math.BigDecimal;

/**
 * 可提现余额DTO
 */
@Data
public class WithdrawableBalanceDTO {
    private BigDecimal withdrawableBalance;  // 可提现余额
    private BigDecimal totalBalance;         // 总余额
    
    public WithdrawableBalanceDTO(BigDecimal withdrawableBalance, BigDecimal totalBalance) {
        this.withdrawableBalance = withdrawableBalance;
        this.totalBalance = totalBalance;
    }
}