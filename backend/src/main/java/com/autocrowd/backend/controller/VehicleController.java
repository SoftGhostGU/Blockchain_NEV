package com.autocrowd.backend.controller;

import com.autocrowd.backend.dto.vehicle.*;
import com.autocrowd.backend.exception.BusinessException;
import com.autocrowd.backend.exception.ExceptionCodeEnum;
import com.autocrowd.backend.service.VehicleService;
import com.autocrowd.backend.util.JwtUtil;
import io.jsonwebtoken.Claims;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 车辆控制器类
 * 处理车辆相关的HTTP请求，作为三层架构中的控制层
 */
@RestController
@RequestMapping("/api/driver/vehicle")
@AllArgsConstructor
public class VehicleController {
    private static final Logger logger = LoggerFactory.getLogger(VehicleController.class);

    private final VehicleService vehicleService;
    private final JwtUtil jwtUtil;
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
            if (token == null || !token.startsWith("Bearer ")) {
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN);
            }
            token = token.substring(7);

            // 解析token获取司机信息
            Claims claims = jwtUtil.parseToken(token);
            String driverIdStr = claims.get("userId", String.class);
            if (driverIdStr == null || driverIdStr.isEmpty()) {
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN, "token中未包含司机ID");
            }
            Integer driverId;
            try {
                driverId = Integer.valueOf(driverIdStr);
            } catch (NumberFormatException e) {
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN, "司机ID格式错误");
            }
            VehicleDTO createdVehicle = vehicleService.createVehicle(driverId, request);
            logger.debug("[VehicleController] 车辆创建成功: {}", createdVehicle);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdVehicle);
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

    /**
     * 删除车辆
     * 根据车辆ID删除指定车辆，需要验证司机权限
     * @param vehicleId 车辆ID
     * @param request HTTP请求对象，包含用户身份信息
     * @return 删除结果响应实体
     */
    @DeleteMapping("/{vehicleId}")
    public ResponseEntity<?> deleteVehicle(@PathVariable Integer vehicleId, HttpServletRequest request) {
        try {
            // 从请求头获取token
            String token = request.getHeader("Authorization");
            if (token == null || !token.startsWith("Bearer ")) {
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN);
            }
            token = token.substring(7);

            // 解析token获取司机信息
            Claims claims = jwtUtil.parseToken(token);
            String driverIdStr = claims.get("userId", String.class);
            if (driverIdStr == null || driverIdStr.isEmpty()) {
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN, "token中未包含司机ID");
            }
            Integer driverId;
            try {
                driverId = Integer.valueOf(driverIdStr);
            } catch (NumberFormatException e) {
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN, "司机ID格式错误");
            }
            boolean result = vehicleService.deleteVehicle(driverId, vehicleId);
            if (result) {
                logger.debug("[VehicleController] 车辆删除成功: vehicleId = {}", vehicleId);
                Map<String, Object> successResponse = new HashMap<>();
                successResponse.put("code", 0);
                successResponse.put("message", "车辆删除成功");
                return ResponseEntity.ok(successResponse);
            } else {
                logger.warn("[VehicleController] 车辆删除失败: vehicleId = {}", vehicleId);
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("code", 500);
                errorResponse.put("message", "车辆删除失败");
                return ResponseEntity.ok(errorResponse);
            }
        } catch (BusinessException e) {
            logger.warn("[VehicleController] 业务异常: code={}, message={}", e.getCode(), e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("code", e.getCode());
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.ok(errorResponse);
        } catch (Exception e) {
            logger.error("[VehicleController] 服务器内部错误: {}, 消息: {}", e.getClass().getName(), e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("code", 500);
            errorResponse.put("message", "服务器内部错误");
            return ResponseEntity.ok(errorResponse);
        }
    }

    /**
     * 更新车辆信息
     * 根据车辆ID更新指定车辆信息，需要验证司机权限
     * @param vehicleId 车辆ID
     * @param request 包含更新车辆信息的请求DTO
     * @param httpRequest HTTP请求对象，包含用户身份信息
     * @return 更新后的车辆DTO响应实体
     */
    @PutMapping("/{vehicleId}")
    public ResponseEntity<?> updateVehicle(@PathVariable Integer vehicleId, @RequestBody VehicleUpdateRequest request, HttpServletRequest httpRequest) {
        try {
            // 从请求头获取token
            String token = httpRequest.getHeader("Authorization");
            if (token == null || !token.startsWith("Bearer ")) {
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN);
            }
            token = token.substring(7);

            // 解析token获取司机信息
            Claims claims = jwtUtil.parseToken(token);
            String driverIdStr = claims.get("userId", String.class);
            if (driverIdStr == null || driverIdStr.isEmpty()) {
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN, "token中未包含司机ID");
            }
            Integer driverId;
            try {
                driverId = Integer.valueOf(driverIdStr);
            } catch (NumberFormatException e) {
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN, "司机ID格式错误");
            }

            // 设置车辆ID到请求对象中
            request.setVehicleId(vehicleId);
            VehicleDTO updatedVehicle = vehicleService.updateVehicle(driverId, request);
            logger.debug("[VehicleController] 车辆更新成功: {}", updatedVehicle);
            return ResponseEntity.ok(updatedVehicle);
        } catch (BusinessException e) {
            logger.warn("[VehicleController] 业务异常: code={}, message={}", e.getCode(), e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("code", e.getCode());
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.ok(errorResponse);
        } catch (Exception e) {
            logger.error("[VehicleController] 服务器内部错误: {}, 消息: {}", e.getClass().getName(), e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("code", 500);
            errorResponse.put("message", "服务器内部错误");
            return ResponseEntity.ok(errorResponse);
        }
    }

    /**
     * 获取司机车辆列表
     * 根据司机ID获取其名下所有车辆信息
     * @param httpRequest HTTP请求对象，包含用户身份信息
     * @return 车辆DTO列表响应实体
     */
    @GetMapping("/list")
    public ResponseEntity<?> getVehicles(HttpServletRequest httpRequest) {
        try {
            // 从请求头获取token
            String token = httpRequest.getHeader("Authorization");
            if (token == null || !token.startsWith("Bearer ")) {
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN);
            }
            token = token.substring(7);

            // 解析token获取司机信息
            Claims claims = jwtUtil.parseToken(token);
            String driverIdStr = claims.get("userId", String.class);
            if (driverIdStr == null || driverIdStr.isEmpty()) {
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN, "token中未包含司机ID");
            }
            Integer driverId;
            try {
                driverId = Integer.valueOf(driverIdStr);
            } catch (NumberFormatException e) {
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN, "司机ID格式错误");
            }
            List<VehicleDTO> vehicles = vehicleService.getVehiclesByDriverId(driverId);
            logger.debug("[VehicleController] 查询到 {} 辆车辆", vehicles.size());
            return ResponseEntity.ok(vehicles);
        } catch (BusinessException e) {
            logger.warn("[VehicleController] 业务异常: code={}, message={}", e.getCode(), e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("code", e.getCode());
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.ok(errorResponse);
        } catch (Exception e) {
            logger.error("[VehicleController] 服务器内部错误: {}, 消息: {}", e.getClass().getName(), e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("code", 500);
            errorResponse.put("message", "服务器内部错误");
            return ResponseEntity.ok(errorResponse);
        }
    }
}