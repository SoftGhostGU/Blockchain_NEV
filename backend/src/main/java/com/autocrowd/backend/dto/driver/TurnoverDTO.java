package com.autocrowd.backend.dto.driver;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class TurnoverDTO {
    private String day;
    private BigDecimal value;
}