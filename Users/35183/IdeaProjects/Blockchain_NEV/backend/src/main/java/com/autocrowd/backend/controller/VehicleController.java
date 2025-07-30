package com.autocrowd.backend.controller;

import com.autocrowd.backend.exception.BusinessException;
import com.autocrowd.backend.exception.ExceptionCodeEnum;
import com.autocrowd.backend.pojo.Vehicle;
import com.autocrowd.backend.service.VehicleService;
import com.autocrowd.backend.util.JwtUtil;
import io.jsonwebtoken.Claims;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/vehicle")
public class VehicleController {

    @Autowired
    private VehicleService vehicleService;

    @Autowired
    private JwtUtil jwtUtil;

    /**
     * 添加车辆接口
     */
    @PostMapping("/add")
    public ResponseEntity<Map<String, Object>> addVehicle(@RequestBody Vehicle vehicle, HttpServletRequest httpRequest) {
        System.out.println("[VehicleController] 收到添加车辆请求: " + vehicle);
        try {
            // 从Authorization头获取token并解析用户ID
            String authHeader = httpRequest.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN);
            }
            String token = authHeader.substring(7);
            Claims claims = jwtUtil.parseToken(token);
            String ownerId = claims.getSubject();
            if (ownerId == null) {
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN);
            }

            vehicle.setOwnerId(ownerId);
            Vehicle savedVehicle = vehicleService.addVehicle(vehicle);
            
            Map<String, Object> result = new HashMap<>();
            Map<String, Object> vehicleData = new HashMap<>();
            vehicleData.put("vehicle_id", savedVehicle.getVehicleId());
            vehicleData.put("brand", savedVehicle.getBrand());
            vehicleData.put("model", savedVehicle.getModel());
            vehicleData.put("license_plate", savedVehicle.getLicensePlate());
            result.put("data", vehicleData);
            System.out.println("[VehicleController] 返回添加车辆结果: " + vehicleData);
            return ResponseEntity.ok(result);
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
     * 更新车辆信息接口
     */
    @PostMapping("/update")
    public ResponseEntity<Map<String, Object>> updateVehicle(@RequestBody Vehicle vehicle, HttpServletRequest httpRequest) {
        System.out.println("[VehicleController] 收到更新车辆请求: " + vehicle);
        try {
            // 从Authorization头获取token并解析用户ID
            String authHeader = httpRequest.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN);
            }
            String token = authHeader.substring(7);
            Claims claims = jwtUtil.parseToken(token);
            String ownerId = claims.getSubject();
            if (ownerId == null) {
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN);
            }

            vehicle.setOwnerId(ownerId);
            Vehicle updatedVehicle = vehicleService.updateVehicle(vehicle);
            
            Map<String, Object> result = new HashMap<>();
            Map<String, Object> vehicleData = new HashMap<>();
            vehicleData.put("vehicle_id", updatedVehicle.getVehicleId());
            vehicleData.put("brand", updatedVehicle.getBrand());
            vehicleData.put("model", updatedVehicle.getModel());
            vehicleData.put("license_plate", updatedVehicle.getLicensePlate());
            result.put("data", vehicleData);
            System.out.println("[VehicleController] 返回更新车辆结果: " + vehicleData);
            return ResponseEntity.ok(result);
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
     * 删除车辆接口
     */
    @PostMapping("/delete")
    public ResponseEntity<Map<String, Object>> deleteVehicle(@RequestParam Integer vehicleId, HttpServletRequest httpRequest) {
        System.out.println("[VehicleController] 收到删除车辆请求: 车辆ID=" + vehicleId);
        try {
            // 从Authorization头获取token并解析用户ID
            String authHeader = httpRequest.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN);
            }
            String token = authHeader.substring(7);
            Claims claims = jwtUtil.parseToken(token);
            String ownerId = claims.getSubject();
            if (ownerId == null) {
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN);
            }

            vehicleService.deleteVehicle(vehicleId, ownerId);
            
            Map<String, Object> result = new HashMap<>();
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("message", "车辆删除成功");
            result.put("data", responseData);
            System.out.println("[VehicleController] 返回删除车辆结果: " + responseData);
            return ResponseEntity.ok(result);
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
     * 查询车主所有车辆接口
     */
    @GetMapping("/list")
    public ResponseEntity<Map<String, Object>> getVehiclesByOwner(HttpServletRequest httpRequest) {
        System.out.println("[VehicleController] 收到查询车辆列表请求");
        try {
            // 从Authorization头获取token并解析用户ID
            String authHeader = httpRequest.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN);
            }
            String token = authHeader.substring(7);
            Claims claims = jwtUtil.parseToken(token);
            String ownerId = claims.getSubject();
            if (ownerId == null) {
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN);
            }

            List<Vehicle> vehicles = vehicleService.getVehiclesByOwner(ownerId);
            
            Map<String, Object> result = new HashMap<>();
            result.put("data", vehicles);
            System.out.println("[VehicleController] 返回车辆列表结果: " + vehicles.size() + " 辆车");
            return ResponseEntity.ok(result);
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
     * 根据ID查询车辆详情接口
     */
    @GetMapping("/detail")
    public ResponseEntity<Map<String, Object>> getVehicleById(@RequestParam Integer vehicleId, HttpServletRequest httpRequest) {
        System.out.println("[VehicleController] 收到查询车辆详情请求: 车辆ID=" + vehicleId);
        try {
            // 从Authorization头获取token并解析用户ID
            String authHeader = httpRequest.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN);
            }
            String token = authHeader.substring(7);
            Claims claims = jwtUtil.parseToken(token);
            String ownerId = claims.getSubject();
            if (ownerId == null) {
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN);
            }

            Vehicle vehicle = vehicleService.getVehicleById(vehicleId);
            
            // 验证车辆是否属于该车主
            if (!vehicle.getOwnerId().equals(ownerId)) {
                throw new BusinessException(ExceptionCodeEnum.VEHICLE_NOT_FOUND);
            }
            
            Map<String, Object> result = new HashMap<>();
            result.put("data", vehicle);
            System.out.println("[VehicleController] 返回车辆详情结果: " + vehicle);
            return ResponseEntity.ok(result);
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