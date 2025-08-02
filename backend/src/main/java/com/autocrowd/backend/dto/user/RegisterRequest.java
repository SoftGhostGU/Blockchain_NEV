package com.autocrowd.backend.dto.user;

import lombok.Data;

@Data
public class RegisterRequest {
    private String phone;
    private String password;
    private String username;
}