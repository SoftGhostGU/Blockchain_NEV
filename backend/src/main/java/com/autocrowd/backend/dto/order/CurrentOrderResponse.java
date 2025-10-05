package com.autocrowd.backend.dto.order;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class CurrentOrderResponse {
    private String orderId;
    private Byte status;
    private String startLocation;
    private String destination;
    private DriverInfoDTO driver;
    private LocalDateTime createdAt;
    private BigDecimal estimatedPrice;

    @Data
    public static class DriverInfoDTO {
        private Integer driverId;
        private String username;
        private String phone;
        private VehicleInfoDTO vehicle;
        private String location;
    }

    @Data
    public static class VehicleInfoDTO {
        private String licensePlate;
        private Integer fuelLevel;
        private Byte status; // 车辆状态(1=可接单,2=不可接单)
    }
}