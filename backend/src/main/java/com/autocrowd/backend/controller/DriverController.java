package com.autocrowd.backend.controller;

import com.autocrowd.backend.dto.driver.DriverLoginRequest;
import com.autocrowd.backend.dto.driver.DriverOrderDetailResponse;
import com.autocrowd.backend.dto.driver.DriverProfileDTO;
import com.autocrowd.backend.dto.driver.DriverRegisterRequest;
import com.autocrowd.backend.dto.driver.TurnoverDTO;
import com.autocrowd.backend.dto.driver.UpdateBankCardRequest;
import com.autocrowd.backend.dto.order.AcceptOrderRequest;
import com.autocrowd.backend.dto.order.CompleteOrderRequest;
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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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

    private static final Logger logger = LoggerFactory.getLogger(DriverController.class);

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
        logger.info("[DriverController] 车主注册接口 - 接收到注册请求: {}", registerRequest);
        try {
            DriverProfileDTO driverResponse = driverService.register(registerRequest);
            Driver driver = driverRepository.findById(driverResponse.getUserId()).orElseThrow();

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
            String username = claims.get("username", String.class);
            if (driverIdStr == null || driverIdStr.isEmpty()) {
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN, "token中未包含司机ID");
            }
            Integer driverId;
            try {
                driverId = Integer.valueOf(driverIdStr);
            } catch (NumberFormatException e) {
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN, "司机ID格式错误");
            }

            List<Vehicle> vehicles = vehicleRepository.findByDriverId(driverId);
            List<VehicleDTO> vehicleDTOs = vehicles.stream().map(vehicle -> {
                VehicleDTO dto = new VehicleDTO();
                dto.setVehicleId(vehicle.getVehicleId());
                dto.setDriverId(vehicle.getDriverId());
                dto.setLicensePlate(vehicle.getLicensePlate());
                dto.setFuelLevel(vehicle.getFuelLevel());
                dto.setConditionId(vehicle.getConditionId());
                dto.setCreatedAt(vehicle.getCreatedAt());
                dto.setUpdatedAt(vehicle.getUpdatedAt());
                return dto;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(vehicleDTOs);
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
     * 车主接单接口
     * 从请求头获取JWT令牌，解析车主ID，接收订单并更新订单状态
     * @param request 接单请求DTO，包含订单ID和车辆ID
     * @param httpRequest HTTP请求对象，包含用户身份信息
     * @return 包含接单结果的响应实体
     */
    @PostMapping("/order/accept")
    public ResponseEntity<Map<String, Object>> acceptOrder(@RequestBody AcceptOrderRequest request, HttpServletRequest httpRequest) {
        logger.info("[DriverController] 收到接单请求: 订单ID={}", request.getOrder_id());
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
            String username = claims.get("username", String.class);
            if (driverIdStr == null || driverIdStr.isEmpty()) {
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN, "token中未包含司机ID");
            }
            Integer driverId;
            try {
                driverId = Integer.valueOf(driverIdStr);
            } catch (NumberFormatException e) {
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN, "司机ID格式错误");
            }

            Order order = orderService.acceptOrder(request.getOrder_id(), driverId, request.getVehicle_id());
            
            Map<String, Object> response = new HashMap<>();
            Map<String, Object> data = new HashMap<>();
            data.put("order_id", order.getOrderId());
            data.put("driver_id", order.getDriverId());
            data.put("vehicle_id", order.getVehicleId());
            data.put("status", order.getStatus());
            response.put("data", data);
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
     * 接收车主登录请求，验证手机号和密码，生成JWT令牌并返回车主信息
     * @param loginRequest 登录请求DTO，包含手机号和密码
     * @return 包含登录结果、车主信息和JWT令牌的响应实体
     */
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody DriverLoginRequest loginRequest) {
        logger.info("[DriverController] 车主登录接口 - 接收到登录请求: {}", loginRequest);
        try {
            DriverProfileDTO driverResponse = driverService.login(loginRequest);
            Driver driver = driverRepository.findById(driverResponse.getUserId()).orElseThrow();

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
     * 结算订单接口
     * 车主完成服务后，输入实际价格完成订单结算
     * @param request 完成订单请求DTO，包含订单ID和实际价格
     * @param httpRequest HTTP请求对象，包含用户身份信息
     * @return 包含结算结果的响应实体
     */
    @PostMapping("/order/complete")
    public ResponseEntity<Map<String, Object>> completeOrder(@RequestBody CompleteOrderRequest request, HttpServletRequest httpRequest) {
        logger.info("[DriverController] 收到结算订单请求: 订单ID={}, 实际价格={}", request.getOrderId(), request.getActualPrice());
        try {
            // 从请求头获取token并解析司机ID
            String token = httpRequest.getHeader("Authorization");
            if (token == null || !token.startsWith("Bearer ")) {
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN);
            }
            token = token.substring(7);
            Claims claims = jwtUtil.parseToken(token);
            String driverIdStr = claims.get("userId", String.class);
            if (driverIdStr == null || driverIdStr.isEmpty()) {
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN, "token中未包含司机ID");
            }
            Integer driverId = Integer.valueOf(driverIdStr);

            // 验证订单ID和实际价格
            String orderId = request.getOrderId();
            BigDecimal actualPrice = request.getActualPrice();
            if (orderId == null || orderId.isEmpty()) {
                throw new BusinessException(ExceptionCodeEnum.PARAM_ERROR, "订单ID不能为空");
            }
            if (actualPrice == null || actualPrice.compareTo(BigDecimal.ZERO) <= 0) {
                throw new BusinessException(ExceptionCodeEnum.PARAM_ERROR, "实际价格必须大于0");
            }

            // 检查订单是否属于该车主
            Order order = orderService.getOrderById(orderId);
            if (!order.getDriverId().equals(driverId)) {
                throw new BusinessException(ExceptionCodeEnum.ORDER_NOT_FOUND, "订单不属于当前车主");
            }
            
            Order completedOrder = orderService.completeOrder(orderId, actualPrice);
            
            Map<String, Object> response = new HashMap<>();
            Map<String, Object> data = new HashMap<>();
            data.put("order_id", completedOrder.getOrderId());
            data.put("status", "Completed");
            data.put("actual_price", actualPrice);
            response.put("data", data);
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
     * 查询车主历史订单接口
     * @param httpRequest HTTP请求对象，包含用户身份信息
     * @return 包含历史订单列表的响应实体
     */
    @GetMapping("/orders/history")
    public ResponseEntity<Map<String, Object>> getDriverOrderHistory(HttpServletRequest httpRequest) {
        logger.info("[DriverController] 收到查询车主历史订单请求");
        try {
            // 从请求头获取token并解析司机ID
            String token = httpRequest.getHeader("Authorization");
            if (token == null || !token.startsWith("Bearer ")) {
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN);
            }
            token = token.substring(7);
            Claims claims = jwtUtil.parseToken(token);
            String driverIdStr = claims.get("userId", String.class);
            if (driverIdStr == null || driverIdStr.isEmpty()) {
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN, "token中未包含司机ID");
            }
            Integer driverId = Integer.valueOf(driverIdStr);

            // 获取历史订单
            List<DriverOrderDetailResponse> historyOrders = orderService.getDriverHistoryOrders(driverId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("data", historyOrders);
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
     * 获取车主近七日营业额接口
     * @param httpRequest HTTP请求对象，包含用户身份信息
     * @return 包含近七日营业额数据的响应实体
     */
    @GetMapping("/turnover/days")
    public ResponseEntity<Map<String, Object>> getDriverTurnoverLast7Days(HttpServletRequest httpRequest) {
        logger.info("[DriverController] 收到查询车主近七日营业额请求");
        try {
            // 从请求头获取token并解析司机ID
            String token = httpRequest.getHeader("Authorization");
            if (token == null || !token.startsWith("Bearer ")) {
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN);
            }
            token = token.substring(7);
            Claims claims = jwtUtil.parseToken(token);
            String driverIdStr = claims.get("userId", String.class);
            if (driverIdStr == null || driverIdStr.isEmpty()) {
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN, "token中未包含司机ID");
            }
            Integer driverId = Integer.valueOf(driverIdStr);

            // 获取近七日营业额数据
            List<TurnoverDTO> turnoverData = orderService.getDriverTurnoverLast7Days(driverId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("data", turnoverData);
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
     * 获取车主近六月营业额接口
     * @param httpRequest HTTP请求对象，包含用户身份信息
     * @return 包含近六月营业额数据的响应实体
     */
    @GetMapping("/turnover/months")
    public ResponseEntity<Map<String, Object>> getDriverTurnoverLastMonths(HttpServletRequest httpRequest) {
        logger.info("[DriverController] 收到查询车主近六月营业额请求");
        try {
            // 从请求头获取token并解析司机ID
            String token = httpRequest.getHeader("Authorization");
            if (token == null || !token.startsWith("Bearer ")) {
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN);
            }
            token = token.substring(7);
            Claims claims = jwtUtil.parseToken(token);
            String driverIdStr = claims.get("userId", String.class);
            if (driverIdStr == null || driverIdStr.isEmpty()) {
                throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN, "token中未包含司机ID");
            }
            Integer driverId = Integer.valueOf(driverIdStr);

            // 获取近六月营业额数据
            List<TurnoverDTO> turnoverData = orderService.getDriverTurnoverLast7Months(driverId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("data", turnoverData);
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
     * 更新车主银行卡号接口
     * 接收车主更新银行卡号请求，验证身份后更新银行卡信息
     * @param request 银行卡号更新请求DTO
     * @param httpRequest HTTP请求对象，包含用户身份信息
     * @return 包含更新结果的响应实体
     */
    @PostMapping("/bankcard")
    public ResponseEntity<Map<String, Object>> updateBankCard(@RequestBody UpdateBankCardRequest request, HttpServletRequest httpRequest) {
        logger.info("[DriverController] 收到更新银行卡号请求");
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

            // 调用服务层更新银行卡号
            DriverProfileDTO updatedDriver = driverService.updateBankCard(driverId, request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("code", 200);
            response.put("message", "银行卡号更新成功");
            response.put("data", updatedDriver);
            return ResponseEntity.ok(response);
        } catch (BusinessException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("code", e.getCode());
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.ok(errorResponse);
        } catch (Exception e) {
            logger.error("[DriverController] 更新银行卡号时发生异常: {}", e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("code", 500);
            errorResponse.put("message", "服务器内部错误: " + e.getMessage());
            return ResponseEntity.ok(errorResponse);
        }
    }
}