
package com.autocrowd.backend.controller;

import com.autocrowd.backend.dto.driver.*;
import com.autocrowd.backend.dto.order.*;
import com.autocrowd.backend.dto.vehicle.VehicleDTO;
import com.autocrowd.backend.entity.Driver;
import com.autocrowd.backend.entity.Order;
import com.autocrowd.backend.entity.Vehicle;
import com.autocrowd.backend.exception.BusinessException;
import com.autocrowd.backend.exception.ExceptionCodeEnum;
import com.autocrowd.backend.repository.DriverRepository;
import com.autocrowd.backend.repository.VehicleRepository;
import com.autocrowd.backend.service.DriverService;
import com.autocrowd.backend.service.OrderService;
import com.autocrowd.backend.util.JwtUtil;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 车主控制器
 * 处理车主注册、登录、车辆管理及订单接收等相关请求
 * 作为表示层，接收前端请求并调用服务层处理业务逻辑
 */
@RestController
@RequestMapping("/api/driver")
@AllArgsConstructor
public class DriverController {

    private final DriverService driverService;
    private final OrderService orderService;

    private final JwtUtil jwtUtil;
    private final DriverRepository driverRepository;
    private final VehicleRepository vehicleRepository;

    /**
     * 车主注册接口
     * 接收车主注册请求，验证车主信息，创建新车主账户并返回身份令牌
     * @param registerRequest 车主注册请求DTO，包含用户名、密码、手机号等注册信息
     * @return 包含注册结果、车主信息和JWT令牌的响应实体
     */
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody DriverRegisterRequest registerRequest) {
        System.out.println("DriverController: 接收到车主注册请求 - " + registerRequest.getUsername());
        System.out.println("[DriverController] 车主注册接口 - 接收到注册请求: " + registerRequest);
        try {
            System.out.println("[DriverController] 调用DriverService.register()方法，处理车主注册业务逻辑");
            DriverProfileDTO driverResponse = driverService.register(registerRequest);
            System.out.println("[DriverController] DriverService.register()返回结果: " + driverResponse);
            Driver driver = driverRepository.findById(driverResponse.getUserId()).orElseThrow();
            System.out.println("[DriverController] 查询到的车主完整信息: " + driver);

            Map<String, Object> driverData = new HashMap<>();
            driverData.put("driver_id", driver.getDriverId());
            driverData.put("username", driver.getUsername());
            driverData.put("credit_score", driver.getCreditScore());
            driverData.put("wallet_balance", driver.getWalletBalance());

            Map<String, Object> data = new HashMap<>();
            String token = jwtUtil.generateToken(driver.getDriverId().toString(), driver.getUsername(), "DRIVER");
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
            errorResponse.put("message", "服务器内部错误");
            return ResponseEntity.ok(errorResponse);
        }
    }


    /**
     * 获取车主车辆列表接口
     * 从请求属性中获取车主ID，查询并返回该车主名下的所有车辆信息
     * @param httpRequest HTTP请求对象，包含用户身份信息
     * @return 包含车辆列表的响应实体
     */
    @GetMapping("/vehicles")
    public ResponseEntity<Map<String, Object>> getDriverVehicles(HttpServletRequest httpRequest) {
        try {
            // 从请求头获取token
            String token = httpRequest.getHeader("Authorization");
            System.out.println("[DriverController] 获取到Authorization头: " + (token != null ? "Bearer ****" : "null"));
            if (token == null || !token.startsWith("Bearer ")) {
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN);
            }
            token = token.substring(7);

            // 解析token获取司机信息
            System.out.println("[DriverController] 开始解析token");
            Claims claims = jwtUtil.parseToken(token);
            System.out.println("[DriverController] token解析成功，claims内容: " + claims);
            String driverIdStr = claims.get("userId", String.class);
            String username = claims.get("username", String.class);
            System.out.println("[DriverController] 从token中解析到司机信息 - driverId: " + driverIdStr + ", username: " + username);
            if (driverIdStr == null || driverIdStr.isEmpty()) {
                System.out.println("[DriverController] token解析失败: 司机ID为空");
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN, "token中未包含司机ID");
            }
            Integer driverId;
            try {
                driverId = Integer.valueOf(driverIdStr);
                System.out.println("[DriverController] 司机ID字符串转换为整数成功: " + driverId);
            } catch (NumberFormatException e) {
                System.out.println("[DriverController] 司机ID格式错误，无法转换为整数: " + driverIdStr);
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN, "司机ID格式错误");
            }

            System.out.println("[DriverController] 查询车主车辆列表，车主ID: " + driverId);
            List<Vehicle> vehicles = vehicleRepository.findByDriverId(driverId);
            System.out.println("[DriverController] 查询到的车辆数量: " + vehicles.size());
            List<VehicleDTO> vehicleDTOs = vehicles.stream()
                    .map(vehicle -> {
                        VehicleDTO dto = new VehicleDTO();
                        dto.setVehicleId(vehicle.getVehicleId());
                        dto.setLicensePlate(vehicle.getLicensePlate());
                        dto.setDriverId(vehicle.getDriverId());
                        dto.setFuelLevel(vehicle.getFuelLevel());
                        dto.setConditionId(vehicle.getConditionId());
                        dto.setCreatedAt(vehicle.getCreatedAt());
                        dto.setUpdatedAt(vehicle.getUpdatedAt());
                        return dto;
                    })
                    .collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("code", 0);
            response.put("data", vehicleDTOs);
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
     * 车主接单接口
     * 接收车主接单请求，验证订单和车辆信息，更新订单状态为已接单
     * @param request 接单请求DTO，包含订单ID和车辆ID
     * @param httpRequest HTTP请求对象，包含用户身份信息
     * @return 包含接单结果的响应实体
     */
    @PostMapping("/order/accept")
    public ResponseEntity<Map<String, Object>> acceptOrder(@RequestBody AcceptOrderRequest request, HttpServletRequest httpRequest) {
        System.out.println("[DriverController] 收到接单请求: 订单ID=" + request.getOrder_id());
        try {
            // 验证订单ID和车辆ID
            if (request.getOrder_id() == null || request.getOrder_id().isEmpty() || request.getVehicle_id() == null || request.getVehicle_id() <= 0) {
                throw new BusinessException(ExceptionCodeEnum.PARAM_ERROR);
            }
            
            // 从请求头获取token
            String token = httpRequest.getHeader("Authorization");
            System.out.println("[DriverController] 获取到Authorization头: " + (token != null ? "Bearer ****" : "null"));
            if (token == null || !token.startsWith("Bearer ")) {
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN);
            }
            token = token.substring(7);

            // 解析token获取司机信息
            System.out.println("[DriverController] 开始解析token");
            Claims claims = jwtUtil.parseToken(token);
            System.out.println("[DriverController] token解析成功，claims内容: " + claims);
            String driverIdStr = claims.get("userId", String.class);
            String username = claims.get("username", String.class);
            System.out.println("[DriverController] 从token中解析到司机信息 - driverId: " + driverIdStr + ", username: " + username);
            if (driverIdStr == null || driverIdStr.isEmpty()) {
                System.out.println("[DriverController] token解析失败: 司机ID为空");
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN, "token中未包含司机ID");
            }
            Integer driverId;
            try {
                driverId = Integer.valueOf(driverIdStr);
                System.out.println("[DriverController] 司机ID字符串转换为整数成功: " + driverId);
            } catch (NumberFormatException e) {
                System.out.println("[DriverController] 司机ID格式错误，无法转换为整数: " + driverIdStr);
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN, "司机ID格式错误");
            }

            System.out.println("[DriverController] 调用OrderService.acceptOrder()方法，处理接单业务逻辑，订单ID: " + request.getOrder_id() + ", 车主ID: " + driverId + ", 车辆ID: " + request.getVehicle_id());
            Order order = orderService.acceptOrder(request.getOrder_id(), driverId, request.getVehicle_id());
            System.out.println("[DriverController] OrderService.acceptOrder()返回结果: " + order);
            Map<String, Object> response = new HashMap<>();
            Map<String, Object> data = new HashMap<>();
            data.put("status", "On the way");
            response.put("data", data);
            System.out.println("[DriverController] 返回接单结果: " + response);
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
     * 车主登录接口
     * 接收车主登录请求，验证手机号和密码，生成JWT令牌并返回车主信息
     * @param loginRequest 登录请求DTO，包含手机号和密码
     * @return 包含登录结果、车主信息和JWT令牌的响应实体
     */
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login (@RequestBody DriverLoginRequest loginRequest){
        System.out.println("DriverController: 接收到车主登录请求 - " + loginRequest.getPhone());
        System.out.println("[DriverController] 车主登录接口 - 接收到登录请求: " + loginRequest);
        try {
            System.out.println("[DriverController] 调用DriverService.login()方法，处理车主登录业务逻辑");
            DriverProfileDTO driverResponse = driverService.login(loginRequest);
            System.out.println("[DriverController] DriverService.login()返回结果: " + driverResponse);
            System.out.println("[DriverController] 查询车主完整信息，车主ID: " + driverResponse.getUserId());
            Driver driver = driverRepository.findById(driverResponse.getUserId()).orElseThrow();
            System.out.println("[DriverController] 查询到的车主完整信息: " + driver);
            Map<String, Object> driverData = new HashMap<>();
            driverData.put("driver_id", driver.getDriverId());
            driverData.put("username", driver.getUsername());
            driverData.put("credit_score", driver.getCreditScore());
            driverData.put("wallet_balance", driver.getWalletBalance());

            Map<String, Object> data = new HashMap<>();

            String token = jwtUtil.generateToken(driver.getDriverId().toString(), driver.getUsername(), "DRIVER");

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
                errorResponse.put("message", "服务器内部错误: " + e.getMessage());
                return ResponseEntity.ok(errorResponse);
        }
    }

    /**
     * 结算订单接口
     * 接收车主结算订单请求，更新订单状态为已完成并写入实际价格
     *
     * @param request     结算订单请求DTO，包含订单ID和实际价格
     * @param httpRequest HTTP请求对象，包含用户身份信息
     * @return 包含结算结果的响应实体
     */
    @PostMapping("/order/complete")
    public ResponseEntity<Map<String, Object>> completeOrder(
            @RequestBody CompleteOrderRequest request,
            HttpServletRequest httpRequest) {
        System.out.println("[DriverController] 收到结算订单请求: 订单ID=" + request.getOrderId() + ", 实际价格=" + request.getActualPrice());
        try {
            // 验证参数
            if (request.getOrderId() == null || request.getOrderId().isEmpty()) {
                throw new BusinessException(ExceptionCodeEnum.PARAM_ERROR, "订单ID不能为空");
            }

            if (request.getActualPrice() == null || request.getActualPrice().compareTo(BigDecimal.ZERO) < 0) {
                throw new BusinessException(ExceptionCodeEnum.PARAM_ERROR, "实际价格必须大于等于0");
            }

            // 从请求头获取token
            String token = httpRequest.getHeader("Authorization");
            System.out.println("[DriverController] 获取到Authorization头: " + (token != null ? "Bearer ****" : "null"));
            if (token == null || !token.startsWith("Bearer ")) {
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN);
            }
            token = token.substring(7);

            // 解析token获取司机信息
            System.out.println("[DriverController] 开始解析token");
            Claims claims = jwtUtil.parseToken(token);
            System.out.println("[DriverController] token解析成功，claims内容: " + claims);
            String driverIdStr = claims.get("userId", String.class);
            String username = claims.get("username", String.class);
            System.out.println("[DriverController] 从token中解析到司机信息 - driverId: " + driverIdStr + ", username: " + username);
            if (driverIdStr == null || driverIdStr.isEmpty()) {
                System.out.println("[DriverController] token解析失败: 司机ID为空");
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN, "token中未包含司机ID");
            }
            Integer driverId;
            try {
                driverId = Integer.valueOf(driverIdStr);
                System.out.println("[DriverController] 司机ID字符串转换为整数成功: " + driverId);
            } catch (NumberFormatException e) {
                System.out.println("[DriverController] 司机ID格式错误，无法转换为整数: " + driverIdStr);
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN, "司机ID格式错误");
            }

            // 检查订单是否属于该车主
            Order order = orderService.getOrderById(request.getOrderId());
            if (!order.getDriverId().equals(driverId)) {
                throw new BusinessException(ExceptionCodeEnum.ORDER_NOT_FOUND, "订单不属于当前车主");
            }

            System.out.println("[DriverController] 调用OrderService.completeOrder()方法，处理结算订单业务逻辑，订单ID: " + request.getOrderId() + ", 实际价格: " + request.getActualPrice());
            Order completedOrder = orderService.completeOrder(request.getOrderId(), request.getActualPrice());
            System.out.println("[DriverController] OrderService.completeOrder()返回结果: " + completedOrder);

            Map<String, Object> response = new HashMap<>();
            Map<String, Object> data = new HashMap<>();
            data.put("order_id", completedOrder.getOrderId());
            data.put("status", "Completed");
            data.put("actual_price", request.getActualPrice());
            response.put("data", data);
            System.out.println("[DriverController] 返回结算订单结果: " + response);
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
     * 获取司机已完成的订单历史
     */
    @GetMapping("/orders/history")
    public ResponseEntity<Map<String, Object>> getDriverOrderHistory(HttpServletRequest httpRequest) {
        System.out.println("[DriverController] 收到查询司机历史订单请求");
        try {
            // 从Authorization头获取token并解析司机ID
            String authHeader = httpRequest.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN);
            }
            String token = authHeader.substring(7);
            Claims claims = jwtUtil.parseToken(token);
            // 获取driverId (注意：生成token时使用的是"userId"，而不是"driverId")
            String driverId = claims.get("userId", String.class);

            if (driverId == null) {
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN);
            }
            List<DriverOrderDetailResponse> historyOrders = orderService.getDriverHistoryOrders(Integer.valueOf(driverId));
            Map<String, Object> result = new HashMap<>();
            result.put("data", historyOrders);
            System.out.println("[DriverController] 返回司机历史订单结果: " + historyOrders.size() + " 条记录");
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
     * 获取车主近七日营业额
     */
    @GetMapping("/turnover/days")
    public ResponseEntity<Map<String, Object>> getDriverTurnoverLast7Days(HttpServletRequest httpRequest) {
        System.out.println("[DriverController] 收到查询司机近七日营业额请求");
        try {
            // 从Authorization头获取token并解析司机ID
            String authHeader = httpRequest.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN);
            }
            String token = authHeader.substring(7);
            Claims claims = jwtUtil.parseToken(token);
            String driverId = claims.get("userId", String.class);

            if (driverId == null) {
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN);
            }
            List<TurnoverDTO> turnoverData = orderService.getDriverTurnoverLast7Days(Integer.valueOf(driverId));
            Map<String, Object> result = new HashMap<>();
            result.put("data", turnoverData);
            System.out.println("[DriverController] 返回司机近七日营业额结果: " + turnoverData.size() + " 条记录");
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
     * 获取车主近七月营业额
     */
    @GetMapping("/turnover/months")
    public ResponseEntity<Map<String, Object>> getDriverTurnoverLast7Months(HttpServletRequest httpRequest) {
        System.out.println("[DriverController] 收到查询司机近七月营业额请求");
        try {
            // 从Authorization头获取token并解析司机ID
            String authHeader = httpRequest.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN);
            }
            String token = authHeader.substring(7);
            Claims claims = jwtUtil.parseToken(token);
            String driverId = claims.get("userId", String.class);

            if (driverId == null) {
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN);
            }
            List<TurnoverDTO> turnoverData = orderService.getDriverTurnoverLast7Months(Integer.valueOf(driverId));
            Map<String, Object> result = new HashMap<>();
            result.put("data", turnoverData);
            System.out.println("[DriverController] 返回司机近七月营业额结果: " + turnoverData.size() + " 条记录");
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