package com.autocrowd.backend.controller;

import com.autocrowd.backend.dto.VehicleCreateRequest;
import com.autocrowd.backend.dto.VehicleUpdateRequest;
import com.autocrowd.backend.dto.VehicleDTO;
import com.autocrowd.backend.exception.BusinessException;
import com.autocrowd.backend.exception.ExceptionCodeEnum;
import com.autocrowd.backend.util.JwtUtil;
import io.jsonwebtoken.Claims;
import com.autocrowd.backend.service.VehicleService;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import jakarta.servlet.http.HttpServletRequest;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 车辆控制器
 * 处理与车辆相关的HTTP请求，作为三层架构中的表示层
 */
@RestController
@RequestMapping("/api/driver/vehicle")
@AllArgsConstructor
public class VehicleController {
    private final VehicleService vehicleService; private final JwtUtil jwtUtil;
    /**
     * 创建新车辆
     * 接收车辆创建请求，关联司机ID，调用服务层完成车辆创建
     * @param request 包含车辆信息的请求DTO
     * @param httpRequest HTTP请求对象，包含用户身份信息
     * @return 包含新创建车辆DTO的响应实体
     */

    @PostMapping
    public ResponseEntity<?> createVehicle(@RequestBody VehicleCreateRequest request, HttpServletRequest httpRequest) {
        try {
            // 从请求头获取token
            String token = httpRequest.getHeader("Authorization");
            System.out.println("[VehicleController] 获取到Authorization头: " + (token != null ? "Bearer ****" : "null"));
            if (token == null || !token.startsWith("Bearer ")) {
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN);
            }
            token = token.substring(7);

            // 解析token获取司机信息
            System.out.println("[VehicleController] 开始解析token");
            Claims claims = jwtUtil.parseToken(token);
            System.out.println("[VehicleController] token解析成功，claims内容: " + claims);
            String driverIdStr = claims.get("userId", String.class);
            String username = claims.get("username", String.class);
            System.out.println("[VehicleController] 从token中解析到司机信息 - driverId: " + driverIdStr + ", username: " + username);
            if (driverIdStr == null || driverIdStr.isEmpty()) {
                System.out.println("[VehicleController] token解析失败: 司机ID为空");
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN, "token中未包含司机ID");
            }
            Integer driverId;
            try {
                driverId = Integer.valueOf(driverIdStr);
                System.out.println("[VehicleController] 司机ID字符串转换为整数成功: " + driverId);
            } catch (NumberFormatException e) {
                System.out.println("[VehicleController] 司机ID格式错误，无法转换为整数: " + driverIdStr);
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN, "司机ID格式错误");
            }

            System.out.println("[VehicleController] 解析到的司机ID: " + driverId + ", 创建车辆请求参数: " + request);
            VehicleDTO createdVehicle = vehicleService.createVehicle(driverId, request);
            System.out.println("[VehicleController] 车辆创建成功: " + createdVehicle);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdVehicle);
        } catch (BusinessException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("code", e.getCode());
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            System.out.println("[VehicleController] 服务器内部错误: " + e.getClass().getName() + ", 消息: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("code", 500);
            errorResponse.put("message", "服务器内部错误: " + e.getMessage());
            return ResponseEntity.ok(errorResponse);
        }
    }

    /**
     * 更新车辆信息
     * 接收车辆更新请求，验证司机权限，调用服务层完成车辆信息更新
     * @param request 包含更新信息的请求DTO
     * @param httpRequest HTTP请求对象，包含用户身份信息
     * @return 包含更新后车辆DTO的响应实体
     */

    @PutMapping
    public ResponseEntity<?> updateVehicle(@RequestBody VehicleUpdateRequest request, HttpServletRequest httpRequest) {
        try {
            // 从请求头获取token
            String token = httpRequest.getHeader("Authorization");
            System.out.println("[VehicleController] 获取到Authorization头: " + (token != null ? "Bearer ****" : "null"));
            if (token == null || !token.startsWith("Bearer ")) {
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN);
            }
            token = token.substring(7);

            // 解析token获取司机信息
            System.out.println("[VehicleController] 开始解析token");
            Claims claims = jwtUtil.parseToken(token);
            System.out.println("[VehicleController] token解析成功，claims内容: " + claims);
            String driverIdStr = claims.get("userId", String.class);
            String username = claims.get("username", String.class);
            System.out.println("[VehicleController] 从token中解析到司机信息 - driverId: " + driverIdStr + ", username: " + username);
            if (driverIdStr == null || driverIdStr.isEmpty()) {
                System.out.println("[VehicleController] token解析失败: 司机ID为空");
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN, "token中未包含司机ID");
            }
            Integer driverId;
            try {
                driverId = Integer.valueOf(driverIdStr);
                System.out.println("[VehicleController] 司机ID字符串转换为整数成功: " + driverId);
            } catch (NumberFormatException e) {
                System.out.println("[VehicleController] 司机ID格式错误，无法转换为整数: " + driverIdStr);
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN, "司机ID格式错误");
            }

            System.out.println("[VehicleController] 解析到的司机ID: " + driverId + ", 更新车辆请求参数: " + request);
            VehicleDTO updatedVehicle = vehicleService.updateVehicle(driverId, request);
            System.out.println("[VehicleController] 车辆更新成功: " + updatedVehicle);
            return ResponseEntity.ok(updatedVehicle);
        } catch (BusinessException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("code", e.getCode());
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            System.out.println("[VehicleController] 服务器内部错误: " + e.getClass().getName() + ", 消息: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("code", 500);
            errorResponse.put("message", "服务器内部错误: " + e.getMessage());
            return ResponseEntity.ok(errorResponse);
        }
    }

    /**
     * 获取司机的所有车辆
     * 从请求中获取司机ID，调用服务层获取该司机的所有车辆信息列表
     * @param request HTTP请求对象，包含用户身份信息
     * @return 包含车辆DTO列表的响应实体
     */

    @GetMapping("/list")
    public ResponseEntity<?> getVehiclesByDriverId(HttpServletRequest request) {
        try {
            // 从请求头获取token
            String token = request.getHeader("Authorization");
            System.out.println("[VehicleController] 获取到Authorization头: " + (token != null ? "Bearer ****" : "null"));
            if (token == null || !token.startsWith("Bearer ")) {
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN);
            }
            token = token.substring(7);

            // 解析token获取司机信息
            System.out.println("[VehicleController] 开始解析token");
            Claims claims = jwtUtil.parseToken(token);
            System.out.println("[VehicleController] token解析成功，claims内容: " + claims);
            String driverIdStr = claims.get("userId", String.class);
            String username = claims.get("username", String.class);
            System.out.println("[VehicleController] 从token中解析到司机信息 - driverId: " + driverIdStr + ", username: " + username);
            if (driverIdStr == null || driverIdStr.isEmpty()) {
                System.out.println("[VehicleController] token解析失败: 司机ID为空");
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN, "token中未包含司机ID");
            }
            Integer driverId;
            try {
                driverId = Integer.valueOf(driverIdStr);
                System.out.println("[VehicleController] 司机ID字符串转换为整数成功: " + driverId);
            } catch (NumberFormatException e) {
                System.out.println("[VehicleController] 司机ID格式错误，无法转换为整数: " + driverIdStr);
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN, "司机ID格式错误");
            }

            System.out.println("[VehicleController] 解析到的司机ID: " + driverId + ", 请求获取车辆列表");
            List<VehicleDTO> vehicles = vehicleService.getVehiclesByDriverId(driverId);
            System.out.println("[VehicleController] 获取车辆列表成功，共 " + vehicles.size() + " 辆车");
            return ResponseEntity.ok(vehicles);
        } catch (BusinessException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("code", e.getCode());
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            System.out.println("[VehicleController] 服务器内部错误: " + e.getClass().getName() + ", 消息: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("code", 500);
            errorResponse.put("message", "服务器内部错误: " + e.getMessage());
            return ResponseEntity.ok(errorResponse);
        }
    }
}