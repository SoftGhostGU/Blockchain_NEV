package com.autocrowd.backend.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter
@Setter
public class CreateOrderRequest {
    private String startLocation;
    private String destination;
    private String vehicleType;
}