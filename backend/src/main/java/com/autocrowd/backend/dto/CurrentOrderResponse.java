package com.autocrowd.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CurrentOrderResponse {
    private Integer order_id;
    private String status;
    private String start_location;
    private String destination;
    private DriverInfoDTO driver;
    private LocalDateTime created_at;

    @Data
    public static class DriverInfoDTO {
        private Integer driver_id;
        private String username;
        private String phone;
        private VehicleInfoDTO vehicle;
        private String location;
    }

    @Data
    public static class VehicleInfoDTO {
        private String license_plate;
        private Double fuel_level;
    }
}