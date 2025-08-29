package com.autocrowd.backend.controller;

import com.autocrowd.backend.dto.PageResult;
import com.autocrowd.backend.entity.*;
import com.autocrowd.backend.exception.BusinessException;
import com.autocrowd.backend.exception.ExceptionCodeEnum;
import com.autocrowd.backend.repository.*;
import com.autocrowd.backend.service.VehicleAuditService;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 管理端控制器
 * 提供管理端查看基础信息和审核功能
 */
@RestController
@RequestMapping("/api/admin")
@AllArgsConstructor
public class AdminController {
    private static final Logger logger = LoggerFactory.getLogger(AdminController.class);

    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final FinancialRepository financialRepository;
    private final ReviewRepository reviewRepository;
    private final VehicleAuditService vehicleAuditService;

    /**
     * 获取所有车辆信息（分页）
     *
     * @param page 页码（从0开始）
     * @param size 每页大小
     * @param licensePlate 车牌号（可选，模糊查询）
     * @param auditStatus 审核状态（可选）
     * @return 车辆信息列表
     */
    @GetMapping("/vehicles")
    public ResponseEntity<?> getAllVehicles(@RequestParam(defaultValue = "0") int page,
                                            @RequestParam(defaultValue = "10") int size,
                                            @RequestParam(required = false) String licensePlate,
                                            @RequestParam(required = false) Byte auditStatus) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            
            Page<Vehicle> vehicles;
            if (licensePlate != null && !licensePlate.isEmpty()) {
                vehicles = vehicleRepository.findByLicensePlateContaining(licensePlate, pageable);
            } else if (auditStatus != null) {
                vehicles = vehicleRepository.findByAuditStatus(auditStatus, pageable);
            } else {
                vehicles = vehicleRepository.findAll(pageable);
            }
            
            PageResult<Vehicle> result = new PageResult<>(
                vehicles.getContent(),
                vehicles.getNumber(),
                vehicles.getSize(),
                vehicles.getTotalElements(),
                vehicles.getTotalPages()
            );
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.error("[AdminController] 获取车辆信息时发生异常: {}", e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("code", 500);
            errorResponse.put("message", "获取车辆信息失败: " + e.getMessage());
            return ResponseEntity.ok(errorResponse);
        }
    }

    /**
     * 获取所有司机信息（分页）
     *
     * @param page 页码（从0开始）
     * @param size 每页大小
     * @param username 用户名（可选，模糊查询）
     * @return 司机信息列表
     */
    @GetMapping("/drivers")
    public ResponseEntity<?> getAllDrivers(@RequestParam(defaultValue = "0") int page,
                                           @RequestParam(defaultValue = "10") int size,
                                           @RequestParam(required = false) String username) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            
            Page<Driver> drivers;
            if (username != null && !username.isEmpty()) {
                drivers = driverRepository.findByUsernameContaining(username, pageable);
            } else {
                drivers = driverRepository.findAll(pageable);
            }
            
            PageResult<Driver> result = new PageResult<>(
                drivers.getContent(),
                drivers.getNumber(),
                drivers.getSize(),
                drivers.getTotalElements(),
                drivers.getTotalPages()
            );
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.error("[AdminController] 获取司机信息时发生异常: {}", e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("code", 500);
            errorResponse.put("message", "获取司机信息失败: " + e.getMessage());
            return ResponseEntity.ok(errorResponse);
        }
    }

    /**
     * 获取所有用户信息（分页）
     *
     * @param page 页码（从0开始）
     * @param size 每页大小
     * @param username 用户名（可选，模糊查询）
     * @return 用户信息列表
     */
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(@RequestParam(defaultValue = "0") int page,
                                         @RequestParam(defaultValue = "10") int size,
                                         @RequestParam(required = false) String username) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            
            Page<User> users;
            if (username != null && !username.isEmpty()) {
                users = userRepository.findByUsernameContaining(username, pageable);
            } else {
                users = userRepository.findAll(pageable);
            }
            
            PageResult<User> result = new PageResult<>(
                users.getContent(),
                users.getNumber(),
                users.getSize(),
                users.getTotalElements(),
                users.getTotalPages()
            );
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.error("[AdminController] 获取用户信息时发生异常: {}", e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("code", 500);
            errorResponse.put("message", "获取用户信息失败: " + e.getMessage());
            return ResponseEntity.ok(errorResponse);
        }
    }

    /**
     * 获取所有订单信息（分页）
     *
     * @param page 页码（从0开始）
     * @param size 每页大小
     * @param orderId 订单ID（可选，模糊查询）
     * @param status 订单状态（可选）
     * @return 订单信息列表
     */
    @GetMapping("/orders")
    public ResponseEntity<?> getAllOrders(@RequestParam(defaultValue = "0") int page,
                                          @RequestParam(defaultValue = "10") int size,
                                          @RequestParam(required = false) String orderId,
                                          @RequestParam(required = false) Byte status) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            
            Page<Order> orders;
            if (orderId != null && !orderId.isEmpty()) {
                orders = orderRepository.findByOrderIdContaining(orderId, pageable);
            } else if (status != null) {
                orders = orderRepository.findByStatus(status, pageable);
            } else {
                orders = orderRepository.findAll(pageable);
            }
            
            PageResult<Order> result = new PageResult<>(
                orders.getContent(),
                orders.getNumber(),
                orders.getSize(),
                orders.getTotalElements(),
                orders.getTotalPages()
            );
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.error("[AdminController] 获取订单信息时发生异常: {}", e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("code", 500);
            errorResponse.put("message", "获取订单信息失败: " + e.getMessage());
            return ResponseEntity.ok(errorResponse);
        }
    }

    /**
     * 获取所有财务信息（分页）
     *
     * @param page 页码（从0开始）
     * @param size 每页大小
     * @param userId 用户ID（可选）
     * @param transactionType 交易类型（可选）
     * @return 财务信息列表
     */
    @GetMapping("/financials")
    public ResponseEntity<?> getAllFinancials(@RequestParam(defaultValue = "0") int page,
                                              @RequestParam(defaultValue = "10") int size,
                                              @RequestParam(required = false) Integer userId,
                                              @RequestParam(required = false) String transactionType) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            
            Page<Financial> financials;
            if (userId != null) {
                financials = financialRepository.findByUserId(userId, pageable);
            } else if (transactionType != null && !transactionType.isEmpty()) {
                financials = financialRepository.findByTransactionType(transactionType, pageable);
            } else {
                financials = financialRepository.findAll(pageable);
            }
            
            PageResult<Financial> result = new PageResult<>(
                financials.getContent(),
                financials.getNumber(),
                financials.getSize(),
                financials.getTotalElements(),
                financials.getTotalPages()
            );
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.error("[AdminController] 获取财务信息时发生异常: {}", e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("code", 500);
            errorResponse.put("message", "获取财务信息失败: " + e.getMessage());
            return ResponseEntity.ok(errorResponse);
        }
    }

    /**
     * 获取所有评论信息（分页）
     *
     * @param page 页码（从0开始）
     * @param size 每页大小
     * @return 评论信息列表
     */
    @GetMapping("/reviews")
    public ResponseEntity<?> getAllReviews(@RequestParam(defaultValue = "0") int page,
                                           @RequestParam(defaultValue = "10") int size) {
        logger.info("[AdminController] 获取所有评论信息: page={}, size={}", page, size);
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Review> reviewPage = reviewRepository.findAll(pageable);
            
            PageResult<Review> result = new PageResult<>(
                reviewPage.getContent(),
                reviewPage.getNumber(),
                reviewPage.getSize(),
                reviewPage.getTotalElements(),
                reviewPage.getTotalPages()
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("code", 200);
            response.put("message", "获取评论信息成功");
            response.put("data", result);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("[AdminController] 获取评论信息异常: {}", e.getMessage(), e);
            throw new BusinessException(ExceptionCodeEnum.REVIEW_QUERY_FAILED, "获取评论信息失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取待审核车辆列表
     *
     * @return 待审核车辆列表
     */
    @GetMapping("/vehicles/pending")
    public ResponseEntity<?> getPendingVehicles() {
        try {
            List<Vehicle> vehicles = vehicleRepository.findByAuditStatus((byte) 1);
            return ResponseEntity.ok(vehicles);
        } catch (Exception e) {
            logger.error("[AdminController] 获取待审核车辆时发生异常: {}", e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("code", 500);
            errorResponse.put("message", "获取待审核车辆失败: " + e.getMessage());
            return ResponseEntity.ok(errorResponse);
        }
    }

    /**
     * 获取待审核评论列表
     *
     * @return 待审核评论列表
     */
    @GetMapping("/reviews/pending")
    public ResponseEntity<?> getPendingReviews() {
        try {
            List<Review> reviews = reviewRepository.findByAuditStatus((byte) 1);
            return ResponseEntity.ok(reviews);
        } catch (Exception e) {
            logger.error("[AdminController] 获取待审核评论时发生异常: {}", e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("code", 500);
            errorResponse.put("message", "获取待审核评论失败: " + e.getMessage());
            return ResponseEntity.ok(errorResponse);
        }
    }

    /**
     * 审核车辆
     *
     * @param vehicleId 车辆ID
     * @param status    审核状态 2=通过, 3=拒绝
     * @return 审核结果
     */
    @PutMapping("/vehicles/{vehicleId}/audit")
    public ResponseEntity<?> auditVehicle(@PathVariable Long vehicleId,
                                          @RequestParam Byte status) {
        try {
            Vehicle vehicle = vehicleAuditService.auditVehicle(vehicleId, status);
            Map<String, Object> response = new HashMap<>();
            response.put("code", 200);
            response.put("message", "车辆审核成功");
            response.put("data", vehicle);
            return ResponseEntity.ok(response);
        } catch (BusinessException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("code", e.getCode());
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.ok(errorResponse);
        } catch (Exception e) {
            logger.error("[AdminController] 审核车辆时发生异常: {}", e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("code", 500);
            errorResponse.put("message", "审核车辆失败: " + e.getMessage());
            return ResponseEntity.ok(errorResponse);
        }
    }

    /**
     * 审核评论
     *
     * @param reviewId 评论ID
     * @param status   审核状态 2=通过, 3=拒绝
     * @return 审核结果
     */
    @PutMapping("/reviews/{reviewId}/audit")
    public ResponseEntity<?> auditReview(@PathVariable Long reviewId,
                                         @RequestParam Byte status) {
        try {
            Review review = vehicleAuditService.auditReview(reviewId, status);
            Map<String, Object> response = new HashMap<>();
            response.put("code", 200);
            response.put("message", "评论审核成功");
            response.put("data", review);
            return ResponseEntity.ok(response);
        } catch (BusinessException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("code", e.getCode());
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.ok(errorResponse);
        } catch (Exception e) {
            logger.error("[AdminController] 审核评论时发生异常: {}", e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("code", 500);
            errorResponse.put("message", "审核评论失败: " + e.getMessage());
            return ResponseEntity.ok(errorResponse);
        }
    }
}