package com.autocrowd.backend.controller;

import com.autocrowd.backend.dto.vehicle.*;
import com.autocrowd.backend.entity.VehicleCondition;
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
            // 从请求头获取token并解析司机ID
            String token = httpRequest.getHeader("Authorization");
            if (token == null || !token.startsWith("Bearer ")) {
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN);
            }
            token = token.substring(7);
            Claims claims = jwtUtil.parseToken(token);
            String driverIdStr = claims.get("driverId", String.class);
            if (driverIdStr == null || driverIdStr.isEmpty()) {
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN, "token中未包含司机ID");
            }
            Integer driverId = Integer.valueOf(driverIdStr);

            VehicleDTO vehicleDTO = vehicleService.createVehicle(driverId, request);
            return ResponseEntity.ok(vehicleDTO);
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
     * 删除车辆
     * 接收车辆删除请求，验证车主身份，调用服务层完成车辆删除
     * @param vehicleId 车辆ID
     * @param httpRequest HTTP请求对象，包含用户身份信息
     * @return 删除结果响应实体
     */
    @DeleteMapping("/{vehicleId}")
    public ResponseEntity<?> deleteVehicle(@PathVariable Integer vehicleId, HttpServletRequest httpRequest) {
        try {
            // 从请求头获取token并解析司机ID
            String token = httpRequest.getHeader("Authorization");
            if (token == null || !token.startsWith("Bearer ")) {
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN);
            }
            token = token.substring(7);
            Claims claims = jwtUtil.parseToken(token);
            String driverIdStr = claims.get("driverId", String.class);
            if (driverIdStr == null || driverIdStr.isEmpty()) {
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN, "token中未包含司机ID");
            }
            Integer driverId = Integer.valueOf(driverIdStr);

            vehicleService.deleteVehicle(vehicleId, driverId);
            return ResponseEntity.ok().build();
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
     * 更新车辆信息
     * 接收车辆更新请求，验证车主身份，调用服务层完成车辆信息更新
     * @param vehicleId 车辆ID
     * @param request 包含车辆更新信息的请求DTO
     * @param httpRequest HTTP请求对象，包含用户身份信息
     * @return 包含更新后车辆DTO的响应实体
     */
    @PutMapping("/{vehicleId}")
    public ResponseEntity<?> updateVehicle(@PathVariable Integer vehicleId,
                                          @RequestBody VehicleUpdateRequest request,
                                          HttpServletRequest httpRequest) {
        try {
            // 从请求头获取token并解析司机ID
            String token = httpRequest.getHeader("Authorization");
            if (token == null || !token.startsWith("Bearer ")) {
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN);
            }
            token = token.substring(7);
            Claims claims = jwtUtil.parseToken(token);
            String driverIdStr = claims.get("driverId", String.class);
            if (driverIdStr == null || driverIdStr.isEmpty()) {
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN, "token中未包含司机ID");
            }
            Integer driverId = Integer.valueOf(driverIdStr);

            // 验证司机ID是否有效
            if (driverId == null || driverId <= 0) {
                throw new BusinessException(ExceptionCodeEnum.PARAM_ERROR, "司机ID无效");
            }
            
            // 将vehicleId设置到request中，以便服务层使用
            request.setVehicleId(vehicleId);
            VehicleDTO vehicleDTO = vehicleService.updateVehicle(driverId, request);
            return ResponseEntity.ok(vehicleDTO);
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
     * 获取车主车辆列表
     * 从请求头解析司机ID，调用服务层获取该车主名下的所有车辆信息
     * @param httpRequest HTTP请求对象，包含用户身份信息
     * @return 包含车辆列表的响应实体
     */
    @GetMapping
    public ResponseEntity<?> getVehicles(HttpServletRequest httpRequest) {
        try {
            // 从请求头获取token并解析司机ID
            String token = httpRequest.getHeader("Authorization");
            if (token == null || !token.startsWith("Bearer ")) {
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN);
            }
            token = token.substring(7);
            Claims claims = jwtUtil.parseToken(token);
            String driverIdStr = claims.get("driverId", String.class);
            if (driverIdStr == null || driverIdStr.isEmpty()) {
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN, "token中未包含司机ID");
            }
            Integer driverId = Integer.valueOf(driverIdStr);

            List<VehicleDTO> vehicles = vehicleService.getVehiclesByDriverId(driverId);
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

    /**
     * 根据车辆ID获取车辆状况信息
     * @param vehicleId 车辆ID
     * @param httpRequest HTTP请求对象，包含用户身份信息
     * @return 包含车辆状况信息的响应实体
     */
    @GetMapping("/{vehicleId}/condition")
    public ResponseEntity<Map<String, Object>> getVehicleCondition(@PathVariable Integer vehicleId, HttpServletRequest httpRequest) {
        logger.info("[VehicleController] 收到获取车辆状况请求: vehicleId={}", vehicleId);
        try {
            // 从请求头获取token
            String token = httpRequest.getHeader("Authorization");
            if (token == null || !token.startsWith("Bearer ")) {
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN);
            }
            token = token.substring(7);

            // 解析token获取司机信息
            Claims claims = jwtUtil.parseToken(token);
            String driverIdStr = claims.get("driverId", String.class);
            if (driverIdStr == null || driverIdStr.isEmpty()) {
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN, "token中未包含司机ID");
            }
            Integer driverId;
            try {
                driverId = Integer.valueOf(driverIdStr);
            } catch (NumberFormatException e) {
                throw new BusinessException(ExceptionCodeEnum.PARAM_ERROR, "司机ID格式错误");
            }

            // 验证车辆是否属于该司机
            boolean isVehicleBelongsToDriver = vehicleService.isVehicleBelongsToDriver(vehicleId, driverId);
            if (!isVehicleBelongsToDriver) {
                throw new BusinessException(ExceptionCodeEnum.PERMISSION_DENIED, "车辆不属于该司机");
            }

            // 调用服务层获取车辆状况
            VehicleCondition vehicleCondition = vehicleService.getVehicleConditionByVehicleId(vehicleId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("code", 200);
            response.put("message", "获取车辆状况成功");
            response.put("data", vehicleCondition);
            return ResponseEntity.ok(response);
        } catch (BusinessException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("code", e.getCode());
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.ok(errorResponse);
        } catch (Exception e) {
            logger.error("[VehicleController] 获取车辆状况时发生异常: {}", e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("code", 500);
            errorResponse.put("message", "服务器内部错误: " + e.getMessage());
            return ResponseEntity.ok(errorResponse);
        }
    }
    
    /**
     * 派出车辆（更新车辆状态为不可接单）
     * @param vehicleId 车辆ID
     * @param httpRequest HTTP请求对象，包含用户身份信息
     * @return 包含更新后车辆DTO的响应实体
     */
    @PutMapping("/{vehicleId}/dispatch")
    public ResponseEntity<?> dispatchVehicle(@PathVariable Integer vehicleId, HttpServletRequest httpRequest) {
        try {
            // 从请求头获取token并解析司机ID
            String token = httpRequest.getHeader("Authorization");
            if (token == null || !token.startsWith("Bearer ")) {
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN);
            }
            token = token.substring(7);
            Claims claims = jwtUtil.parseToken(token);
            String driverIdStr = claims.get("driverId", String.class);
            if (driverIdStr == null || driverIdStr.isEmpty()) {
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN, "token中未包含司机ID");
            }
            Integer driverId = Integer.valueOf(driverIdStr);

            // 更新车辆状态为不可接单(2)
            VehicleDTO vehicleDTO = vehicleService.updateVehicleStatus(driverId, vehicleId, (byte) 2);
            return ResponseEntity.ok(vehicleDTO);
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
     * 收回车辆（更新车辆状态为可接单）
     * @param vehicleId 车辆ID
     * @param httpRequest HTTP请求对象，包含用户身份信息
     * @return 包含更新后车辆DTO的响应实体
     */
    @PutMapping("/{vehicleId}/recall")
    public ResponseEntity<?> recallVehicle(@PathVariable Integer vehicleId, HttpServletRequest httpRequest) {
        try {
            // 从请求头获取token并解析司机ID
            String token = httpRequest.getHeader("Authorization");
            if (token == null || !token.startsWith("Bearer ")) {
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN);
            }
            token = token.substring(7);
            Claims claims = jwtUtil.parseToken(token);
            String driverIdStr = claims.get("driverId", String.class);
            if (driverIdStr == null || driverIdStr.isEmpty()) {
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN, "token中未包含司机ID");
            }
            Integer driverId = Integer.valueOf(driverIdStr);

            // 更新车辆状态为可接单(1)
            VehicleDTO vehicleDTO = vehicleService.updateVehicleStatus(driverId, vehicleId, (byte) 1);
            return ResponseEntity.ok(vehicleDTO);
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
}