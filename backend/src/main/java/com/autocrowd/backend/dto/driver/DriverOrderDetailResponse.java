package com.autocrowd.backend.dto.driver;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class DriverOrderDetailResponse {
    private String orderId;
    private String startLocation;
    private String destination;
    private Byte status;
    private BigDecimal estimatedPrice;
    private BigDecimal actualPrice;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String type;
    
    private UserInfoDTO user;
    private VehicleInfoDTO vehicle;
    private ReviewInfoDTO review;

    @Data
    public static class UserInfoDTO {
        private Integer userId;
        private String username;
        // 不包含手机号等敏感信息
    }

    @Data
    public static class VehicleInfoDTO {
        private Integer vehicleId;
        private String licensePlate;
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