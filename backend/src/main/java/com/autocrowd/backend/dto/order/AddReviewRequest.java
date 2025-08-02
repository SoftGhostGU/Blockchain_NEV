package com.autocrowd.backend.dto.order;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class AddReviewRequest {
    private String orderId;
    private String content;
    private BigDecimal commentStar;
}