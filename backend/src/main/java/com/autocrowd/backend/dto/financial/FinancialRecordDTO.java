package com.autocrowd.backend.dto.financial;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class FinancialRecordDTO {
    private Integer financialId;
    private Integer userId;
    private String role;
    private String transactionType;
    private BigDecimal amount;
    private LocalDateTime transactionTime;
}