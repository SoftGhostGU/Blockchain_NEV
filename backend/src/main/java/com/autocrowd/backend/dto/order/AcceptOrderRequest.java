package com.autocrowd.backend.dto.order;

import lombok.Data;

@Data
public class AcceptOrderRequest {
    private String order_id;
    private Integer vehicle_id;
}