package com.autocrowd.backend.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String phone;
    private String password;
}