package com.autocrowd.backend.dto;

import lombok.Data;

@Data
public class AcceptOrderRequest {
    private Integer order_id;
    private Integer vehicle_id;
}