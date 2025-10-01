package com.autocrowd.backend.controller;

import com.autocrowd.backend.dto.financial.FinancialRecordDTO;
import com.autocrowd.backend.dto.financial.RechargeRequest;
import com.autocrowd.backend.dto.financial.WithdrawRequest;
import com.autocrowd.backend.exception.BusinessException;
import com.autocrowd.backend.exception.ExceptionCodeEnum;
import com.autocrowd.backend.service.FinancialService;
import com.autocrowd.backend.util.JwtUtil;
import io.jsonwebtoken.Claims;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/financial")
public class FinancialController {
    
    @Autowired
    private FinancialService financialService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    /**
     * 用户充值接口
     */
    @PostMapping("/recharge")
    public ResponseEntity<Map<String, Object>> recharge(HttpServletRequest request, @RequestBody RechargeRequest rechargeRequest) {
        try {
            // 从请求头获取token
            String token = request.getHeader("Authorization");
            if (token == null || !token.startsWith("Bearer ")) {
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN);
            }
            token = token.substring(7);

            // 解析token获取用户信息
            Claims claims = jwtUtil.parseToken(token);
            String userIdStr = claims.get("userId", String.class);
            String driverIdStr = claims.get("driverId", String.class);
            String role = claims.get("role", String.class);
            
            // 兼容处理：车主使用driverId，普通用户使用userId
            if (userIdStr == null && driverIdStr == null) {
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN, "token中未包含用户ID或车主ID");
            }
            
            // 优先使用存在的ID（车主使用driverId，用户使用userId）
            Integer userId;
            if (userIdStr != null && !userIdStr.isEmpty()) {
                userId = Integer.valueOf(userIdStr);
            } else if (driverIdStr != null && !driverIdStr.isEmpty()) {
                userId = Integer.valueOf(driverIdStr);
                // 车主的role应该是"driver"（小写）
                if (role == null || !"driver".equals(role)) {
                    role = "driver";
                }
            } else {
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN, "用户ID格式错误");
            }
            
            // 执行充值操作
            financialService.recharge(userId, role, rechargeRequest.getAmount());
            
            Map<String, Object> response = new HashMap<>();
            response.put("code", 0);
            response.put("message", "充值成功");
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
    
    /**
     * 用户提现接口
     */
    @PostMapping("/withdraw")
    public ResponseEntity<Map<String, Object>> withdraw(HttpServletRequest request, @RequestBody WithdrawRequest withdrawRequest) {
        try {
            // 从请求头获取token
            String token = request.getHeader("Authorization");
            if (token == null || !token.startsWith("Bearer ")) {
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN);
            }
            token = token.substring(7);

            // 解析token获取用户信息
            Claims claims = jwtUtil.parseToken(token);
            String userIdStr = claims.get("userId", String.class);
            String driverIdStr = claims.get("driverId", String.class);
            String role = claims.get("role", String.class);
            
            // 兼容处理：车主使用driverId，普通用户使用userId
            if (userIdStr == null && driverIdStr == null) {
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN, "token中未包含用户ID或车主ID");
            }
            
            // 优先使用存在的ID（车主使用driverId，用户使用userId）
            Integer userId;
            if (userIdStr != null && !userIdStr.isEmpty()) {
                userId = Integer.valueOf(userIdStr);
            } else if (driverIdStr != null && !driverIdStr.isEmpty()) {
                userId = Integer.valueOf(driverIdStr);
                // 车主的role应该是"driver"（小写）
                if (role == null || !"driver".equals(role)) {
                    role = "driver";
                }
            } else {
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN, "用户ID格式错误");
            }
            
            // 执行提现操作
            financialService.withdraw(userId, role, withdrawRequest.getAmount());
            
            Map<String, Object> response = new HashMap<>();
            response.put("code", 0);
            response.put("message", "提现成功");
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
    
    /**
     * 查询用户财务记录接口
     */
    @GetMapping("/records")
    public ResponseEntity<Map<String, Object>> getFinancialRecords(
            HttpServletRequest request,
            @RequestParam(required = false) String startTime,
            @RequestParam(required = false) String endTime) {
        try {
            // 从请求头获取token
            String token = request.getHeader("Authorization");
            if (token == null || !token.startsWith("Bearer ")) {
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN);
            }
            token = token.substring(7);

            // 解析token获取用户信息
            Claims claims = jwtUtil.parseToken(token);
            String userIdStr = claims.get("userId", String.class);
            String driverIdStr = claims.get("driverId", String.class);
            String role = claims.get("role", String.class);
            
            // 兼容处理：车主使用driverId，普通用户使用userId
            if (userIdStr == null && driverIdStr == null) {
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN, "token中未包含用户ID或车主ID");
            }
            
            // 优先使用存在的ID（车主使用driverId，用户使用userId）
            Integer userId;
            if (userIdStr != null && !userIdStr.isEmpty()) {
                userId = Integer.valueOf(userIdStr);
            } else if (driverIdStr != null && !driverIdStr.isEmpty()) {
                userId = Integer.valueOf(driverIdStr);
                // 车主的role应该是"driver"（小写）
                if (role == null || !"driver".equals(role)) {
                    role = "driver";
                }
            } else {
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN, "用户ID格式错误");
            }
            
            // 解析时间参数
            LocalDateTime start = startTime != null ? 
                LocalDateTime.parse(startTime, DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")) : 
                LocalDateTime.now().minusDays(30); // 默认查询最近30天
                
            LocalDateTime end = endTime != null ? 
                LocalDateTime.parse(endTime, DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")) : 
                LocalDateTime.now(); // 默认到当前时间
            
            // 查询财务记录
            List<FinancialRecordDTO> records = financialService.getUserFinancialRecords(userId, role, start, end);
            
            Map<String, Object> response = new HashMap<>();
            response.put("code", 0);
            response.put("data", records);
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