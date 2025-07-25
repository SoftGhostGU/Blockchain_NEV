package com.autocrowd.backend.controller;

import com.autocrowd.backend.dto.DriverLoginRequest;
import com.autocrowd.backend.dto.DriverProfileDTO;
import com.autocrowd.backend.entity.Driver;
import com.autocrowd.backend.exception.BusinessException;
import com.autocrowd.backend.repository.DriverRepository;
import com.autocrowd.backend.service.DriverService;
import com.autocrowd.backend.util.JwtUtil;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import com.autocrowd.backend.dto.DriverRegisterRequest;
import com.autocrowd.backend.dto.DriverProfileDTO;
import com.autocrowd.backend.service.DriverService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * 车主控制器，处理车主相关请求
 */
@RestController
@RequestMapping("/api/driver")
@AllArgsConstructor
public class DriverController {

    private final DriverService driverService;
    private final JwtUtil jwtUtil;
    private final DriverRepository driverRepository;

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody DriverRegisterRequest registerRequest) {
        System.out.println("DriverController: 接收到车主注册请求 - " + registerRequest.getUsername());
        System.out.println("[DriverController] 车主注册接口 - 接收到注册请求: " + registerRequest);
        try {
            DriverProfileDTO driverResponse = driverService.register(registerRequest);
            Driver driver = driverRepository.findById(driverResponse.getUserId()).orElseThrow();

            Map<String, Object> driverData = new HashMap<>();
            driverData.put("driver_id", driver.getDriverId());
            driverData.put("username", driver.getUsername());
            driverData.put("credit_score", driver.getCreditScore());
            driverData.put("wallet_balance", driver.getWalletBalance());

            Map<String, Object> data = new HashMap<>();
            String token = jwtUtil.generateToken(driver.getDriverId().toString(), driver.getUsername());
            data.put("token", token);
            data.put("driver", driverData);

            Map<String, Object> response = new HashMap<>();
            response.put("code", 0);
            response.put("data", data);
            System.out.println("[DriverController] 车主注册接口 - 返回注册响应: " + response);
            return ResponseEntity.ok(response);
        } catch (BusinessException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("code", e.getCode());
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.ok(errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("code", 500);
            errorResponse.put("message", "服务器内部错误: " + e.getMessage());
            return ResponseEntity.ok(errorResponse);
        }
    }

    /**
     * 车主登录接口
     */
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody DriverLoginRequest loginRequest) {
        System.out.println("DriverController: 接收到车主登录请求 - " + loginRequest.getPhone());
        System.out.println("[DriverController] 车主登录接口 - 接收到登录请求: " + loginRequest);
        try {
            DriverProfileDTO driverResponse = driverService.login(loginRequest);
            Driver driver = driverRepository.findById(driverResponse.getUserId()).orElseThrow();

            Map<String, Object> driverData = new HashMap<>();
            driverData.put("driver_id", driver.getDriverId());
            driverData.put("username", driver.getUsername());
            driverData.put("credit_score", driver.getCreditScore());
            driverData.put("wallet_balance", driver.getWalletBalance());

            Map<String, Object> data = new HashMap<>();
            String token = jwtUtil.generateToken(driver.getDriverId().toString(), driver.getUsername());
            data.put("token", token);
            data.put("driver", driverData);

            Map<String, Object> response = new HashMap<>();
            response.put("code", 0);
            response.put("data", data);
            System.out.println("[DriverController] 车主登录接口 - 返回登录响应: " + response);
            return ResponseEntity.ok(response);
        } catch (BusinessException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("code", e.getCode());
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.ok(errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("code", 500);
            errorResponse.put("message", "服务器内部错误");
            return ResponseEntity.ok(errorResponse);
        }
    }
}