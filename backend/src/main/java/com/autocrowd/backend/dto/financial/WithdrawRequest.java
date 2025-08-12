package com.autocrowd.backend.dto.financial;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class WithdrawRequest {
    private BigDecimal amount;
}