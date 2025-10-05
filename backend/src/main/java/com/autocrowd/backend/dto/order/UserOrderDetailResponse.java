package com.autocrowd.backend.dto.order;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class UserOrderDetailResponse {
    private String orderId;           // 订单ID (如: ORD20250717001)
    private String orderTime;         // 下单时间 (如: 2025-07-17 10:00:00)
    private String orderType;         // 订单类型 (如: 网约车)
    private BigDecimal balance;       // 余额变动数值
    private String status;            // 订单状态 (如: 已完成)
    private String startLocation;     // 起点位置
    private String endLocation;       // 终点位置
    private String username;          // 用户名
    private BigDecimal commentStar;   // 评分
    private String commentText;       // 评价内容
    
    // 保留原有字段用于向后兼容
    private String destination;       // 兼容字段
    private BigDecimal estimatedPrice;
    private BigDecimal actualPrice;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String type;
    
    private DriverInfoDTO driver;
    private ReviewInfoDTO review;

    @Data
    public static class DriverInfoDTO {
        private Integer driverId;
        private String username;
        private Integer creditScore;
    }

    @Data
    public static class ReviewInfoDTO {
        private Integer reviewId;
        private String content;
        private BigDecimal commentStar;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }
}