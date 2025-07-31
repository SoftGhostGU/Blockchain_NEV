package com.autocrowd.backend.service.impl;

import com.autocrowd.backend.dto.CreateOrderRequest;
import com.autocrowd.backend.dto.EstimatePriceRequest;
import com.autocrowd.backend.dto.UserOrderDetailResponse;
import com.autocrowd.backend.dto.DriverOrderDetailResponse;
import com.autocrowd.backend.entity.Driver;
import com.autocrowd.backend.entity.Order;
import com.autocrowd.backend.entity.Review;
import com.autocrowd.backend.entity.Vehicle;
import com.autocrowd.backend.entity.User;
import com.autocrowd.backend.exception.ExceptionCodeEnum;
import com.autocrowd.backend.exception.BusinessException;
import com.autocrowd.backend.repository.DriverRepository;
import com.autocrowd.backend.repository.OrderRepository;
import com.autocrowd.backend.repository.VehicleRepository;
import com.autocrowd.backend.repository.UserRepository;
import com.autocrowd.backend.service.OrderService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

import com.autocrowd.backend.dto.CurrentOrderResponse;
import com.autocrowd.backend.dto.AddReviewRequest;
import com.autocrowd.backend.repository.ReviewRepository;

@Service
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final DriverRepository driverRepository;
    private final VehicleRepository vehicleRepository;
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;

    public OrderServiceImpl(OrderRepository orderRepository, DriverRepository driverRepository, VehicleRepository vehicleRepository, ReviewRepository reviewRepository, UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.driverRepository = driverRepository;
        this.vehicleRepository = vehicleRepository;
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
    }
    
    /**
     * 创建新订单
     * @param request 创建订单请求DTO
     * @param userId 用户ID
     * @return 创建的订单实体
     * @throws BusinessException 当参数无效或创建失败时抛出
     */
    @Override
    public Order createOrder(CreateOrderRequest request, String userId) {
        try {
            // 验证请求参数
            if (request.getStartLocation() == null || request.getStartLocation().trim().isEmpty()) {
                throw new BusinessException(ExceptionCodeEnum.PARAM_ERROR, "出发地不能为空");
            }
            if (request.getDestination() == null || request.getDestination().trim().isEmpty()) {
                throw new BusinessException(ExceptionCodeEnum.PARAM_ERROR, "目的地不能为空");
            }
            if (request.getVehicleType() == null || request.getVehicleType().trim().isEmpty()) {
                throw new BusinessException(ExceptionCodeEnum.PARAM_ERROR, "车辆类型不能为空");
            }

            System.out.println("[OrderService] 收到创建订单请求: 起点=" + request.getStartLocation() + ", 终点=" + request.getDestination() + ", 车辆类型=" + request.getVehicleType());

            // 生成订单ID (形如 ORD20250717001)
            String orderId = "ORD" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) + 
                            String.format("%03d", (new Random()).nextInt(1000));

            // 创建订单实体
            Order order = new Order();
            order.setOrderId(orderId);
            order.setUserId(Integer.valueOf(userId));
            order.setDriverId(request.getDriverId());
            order.setVehicleId(request.getVehicleId());
            order.setStartLocation(request.getStartLocation());
            order.setDestination(request.getDestination());
            order.setStatus((byte) 0); // 0=Waiting
            // 设置预估价格占位符
            order.setEstimatedPrice(BigDecimal.valueOf(0.0)); // 占位符价格，实际应通过算法计算
            order.setType(request.getVehicleType());
            order.setCreatedAt(LocalDateTime.now());
            order.setUpdatedAt(LocalDateTime.now());

            // 保存订单
            Order savedOrder = orderRepository.save(order);
            System.out.println("[OrderService] 订单创建成功: " + savedOrder.getOrderId());

            return savedOrder;
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            System.err.println("[OrderService] 创建订单异常: " + e.getMessage());
            throw new BusinessException(ExceptionCodeEnum.ORDER_CREATE_FAILED, "创建订单失败: " + e.getMessage());
        }
    }

    /**
     * 价格预估
     * @param request 预估请求参数
     * @return 预估结果包含价格、距离和时间
     */
    @Override
    public Map<String, Object> estimatePrice(EstimatePriceRequest request) {
        System.out.println("[OrderService] 处理价格预估请求: " + request);
        
        Map<String, Object> result = new HashMap<>();
        
        // 简单的价格计算逻辑（实际项目中应该基于距离、时间等因素计算）
        double distance = Math.random() * 50 + 5; // 模拟距离 5-55 公里
        double time = distance / 30 * 60; // 模拟时间，假设平均速度30公里/小时
        BigDecimal price = BigDecimal.valueOf(distance * 2.5).setScale(2, RoundingMode.HALF_UP); // 每公里2.5元
        
        result.put("distance", String.format("%.2f公里", distance));
        result.put("time", String.format("%.0f分钟", time));
        result.put("price", price);
        
        System.out.println("[OrderService] 价格预估完成: " + result);
        return result;
    }

    /**
     * 获取所有当前进行中的订单
     * @return 进行中的订单信息列表
     */
    @Override
    public List<CurrentOrderResponse> getAllCurrentOrder() {
        System.out.println("[OrderService] 获取所有进行中的订单");
        
        try {
            // 查询状态为 1=On the way 或 2=In progress 的订单
            List<Byte> statuses = Arrays.asList((byte) 1, (byte) 2);
            
            List<Order> orders = orderRepository.findByStatusIn(statuses);
            System.out.println("[OrderService] 查询到进行中的订单数量: " + orders.size());
            
            // 转换为响应DTO
            List<CurrentOrderResponse> responses = new ArrayList<>();
            for (Order order : orders) {
                CurrentOrderResponse response = new CurrentOrderResponse();
                response.setOrderId(order.getOrderId());
                response.setStartLocation(order.getStartLocation());
                response.setDestination(order.getDestination());
                response.setStatus(order.getStatus());
                response.setEstimatedPrice(order.getEstimatedPrice());
                response.setCreatedAt(order.getCreatedAt());
                
                // 如果订单有司机ID，获取司机和车辆信息
                if (order.getDriverId() != null) {
                    Optional<Driver> driverOpt = driverRepository.findById(order.getDriverId());
                    if (driverOpt.isPresent()) {
                        Driver driver = driverOpt.get();
                        CurrentOrderResponse.DriverInfoDTO driverInfo = new CurrentOrderResponse.DriverInfoDTO();
                        driverInfo.setDriverId(driver.getDriverId());
                        driverInfo.setUsername(driver.getUsername());
                        driverInfo.setPhone(driver.getPhone());
                        
                        // 如果订单有车辆ID，获取车辆信息
                        if (order.getVehicleId() != null) {
                            Optional<Vehicle> vehicleOpt = vehicleRepository.findById(order.getVehicleId());
                            if (vehicleOpt.isPresent()) {
                                Vehicle vehicle = vehicleOpt.get();
                                CurrentOrderResponse.VehicleInfoDTO vehicleInfo = new CurrentOrderResponse.VehicleInfoDTO();
                                vehicleInfo.setLicensePlate(vehicle.getLicensePlate());
                                vehicleInfo.setFuelLevel(vehicle.getFuelLevel());
                                driverInfo.setVehicle(vehicleInfo);
                            }
                        }
                        
                        response.setDriver(driverInfo);
                    }
                }
                
                responses.add(response);
            }
                
            System.out.println("[OrderService] 转换订单列表完成");
            return responses;
        } catch (Exception e) {
            System.err.println("[OrderService] 获取进行中的订单异常: " + e.getMessage());
            throw new BusinessException(ExceptionCodeEnum.ORDER_GET_FAILED, "查询订单失败: " + e.getMessage());
        }
    }

    /**
     * 根据订单ID获取订单详情
     * @param orderId 订单ID
     * @return 订单详情
     */
    @Override
    public Order getOrderById(String orderId) {
        System.out.println("[OrderService] 根据ID获取订单详情: " + orderId);
        
        try {
            return orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException(ExceptionCodeEnum.ORDER_NOT_FOUND, "订单不存在"));
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            System.err.println("[OrderService] 获取订单详情异常: " + e.getMessage());
            throw new BusinessException(ExceptionCodeEnum.ORDER_GET_FAILED, "查询订单失败: " + e.getMessage());
        }
    }

    /**
     * 更新订单状态
     * @param orderId 订单ID
     * @param status 新状态
     * @return 更新后的订单
     */
    @Override
    public Order updateOrderStatus(String orderId, byte status) {
        System.out.println("[OrderService] 更新订单状态: orderId=" + orderId + ", status=" + status);
        
        try {
            // 获取订单
            Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException(ExceptionCodeEnum.ORDER_NOT_FOUND, "订单不存在"));
            
            // 更新状态
            order.setStatus(status);
            order.setUpdatedAt(LocalDateTime.now());
            
            // 保存更新
            Order updatedOrder = orderRepository.save(order);
            System.out.println("[OrderService] 订单状态更新成功: " + updatedOrder.getOrderId());
            
            return updatedOrder;
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            System.err.println("[OrderService] 更新订单状态异常: " + e.getMessage());
            throw new BusinessException(ExceptionCodeEnum.ORDER_UPDATE_FAILED, "更新订单状态失败: " + e.getMessage());
        }
    }

    /**
     * 司机接单
     * @param orderId 订单ID
     * @param driverId 司机ID
     * @param vehicleId 车辆ID
     * @return 接单结果
     */
    @Override
    public Order acceptOrder(String orderId, Integer driverId, Integer vehicleId) {
        System.out.println("[OrderService] 司机接单: orderId=" + orderId + ", driverId=" + driverId + ", vehicleId=" + vehicleId);
        
        try {
            // 获取订单
            Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException(ExceptionCodeEnum.ORDER_NOT_FOUND, "订单不存在"));
            
            // 检查订单状态是否为等待中
            if (order.getStatus() != 0) {
                throw new BusinessException(ExceptionCodeEnum.ORDER_STATUS_ERROR, "订单状态不正确，无法接单");
            }
            
            // 设置司机ID、车辆ID和状态
            order.setDriverId(driverId);
            order.setVehicleId(vehicleId);
            order.setStatus((byte) 1); // 1=On the way
            order.setUpdatedAt(LocalDateTime.now());
            
            // 保存更新
            Order updatedOrder = orderRepository.save(order);
            System.out.println("[OrderService] 司机接单成功: " + updatedOrder.getOrderId());
            
            return updatedOrder;
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            System.err.println("[OrderService] 司机接单异常: " + e.getMessage());
            throw new BusinessException(ExceptionCodeEnum.ORDER_ACCEPT_FAILED, "接单失败: " + e.getMessage());
        }
    }

    @Override
    public List<Order> getCurrentOrderByStatus(String status) {
        return new ArrayList<>();
    }

    /**
     * 结算订单
     * @param orderId 订单ID
     * @param actualPrice 实际价格
     * @return 结算后的订单
     */
    @Override
    public Order completeOrder(String orderId, BigDecimal actualPrice) {
        System.out.println("[OrderService] 结算订单: orderId=" + orderId + ", actualPrice=" + actualPrice);
        
        try {
            // 获取订单
            Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException(ExceptionCodeEnum.ORDER_NOT_FOUND, "订单不存在"));
            
            // 检查订单状态是否为进行中
            if (order.getStatus() != 2) { // 2=In progress
                throw new BusinessException(ExceptionCodeEnum.ORDER_STATUS_ERROR, "订单状态不正确，无法结算");
            }
            
            // 设置实际价格和状态
            order.setActualPrice(actualPrice);
            order.setStatus((byte) 3); // 3=Completed
            order.setUpdatedAt(LocalDateTime.now());
            
            // 保存更新
            Order updatedOrder = orderRepository.save(order);
            System.out.println("[OrderService] 订单结算成功: " + updatedOrder.getOrderId());
            
            return updatedOrder;
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            System.err.println("[OrderService] 订单结算异常: " + e.getMessage());
            throw new BusinessException(ExceptionCodeEnum.ORDER_COMPLETE_FAILED, "订单结算失败: " + e.getMessage());
        }
    }
    
    /**
     * 添加订单评价
     * @param request 评价请求
     * @param userId 用户ID
     * @return 评价结果
     */
    @Override
    public Review addReview(AddReviewRequest request, String userId) {
        System.out.println("[OrderService] 添加订单评价: orderId=" + request.getOrderId() + ", userId=" + userId);
        
        try {
            // 获取订单
            Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new BusinessException(ExceptionCodeEnum.ORDER_NOT_FOUND, "订单不存在"));
            
            // 检查订单状态是否为已完成
            if (order.getStatus() != 3) { // 3=Completed
                throw new BusinessException(ExceptionCodeEnum.ORDER_STATUS_ERROR, "只能对已完成的订单进行评价");
            }
            
            // 检查是否已经评价过
            List<Review> existingReviews = reviewRepository.findByOrderId(request.getOrderId());
            if (!existingReviews.isEmpty()) {
                throw new BusinessException(ExceptionCodeEnum.REVIEW_ALREADY_EXISTS, "该订单已评价");
            }
            
            // 创建评价
            Review review = new Review();
            review.setOrderId(request.getOrderId());
            review.setUserId(Integer.valueOf(userId));
            review.setDriverId(order.getDriverId());
            review.setContent(request.getContent());
            review.setCommentStar(request.getCommentStar());
            review.setCreatedAt(LocalDateTime.now());
            review.setUpdatedAt(LocalDateTime.now());
            
            // 保存评价
            Review savedReview = reviewRepository.save(review);
            System.out.println("[OrderService] 订单评价添加成功: " + savedReview.getReviewId());
            
            return savedReview;
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            System.err.println("[OrderService] 添加订单评价异常: " + e.getMessage());
            throw new BusinessException(ExceptionCodeEnum.REVIEW_CREATE_FAILED, "添加评价失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取用户的历史订单（已完成的订单）
     * @param userId 用户ID
     * @return 订单详情列表
     */
    @Override
    public List<UserOrderDetailResponse> getUserHistoryOrders(Integer userId) {
        System.out.println("[OrderService] 获取用户历史订单: userId=" + userId);
        
        try {
            // 查询用户已完成的订单（状态为3）
            List<Order> orders = orderRepository.findByUserIdAndStatus(userId, (byte) 3);
            
            // 转换为用户端专用的详细响应DTO
            List<UserOrderDetailResponse> responses = new ArrayList<>();
            for (Order order : orders) {
                UserOrderDetailResponse response = convertToUserOrderDetailResponse(order);
                responses.add(response);
            }
            
            System.out.println("[OrderService] 获取用户历史订单完成，共找到 " + responses.size() + " 条记录");
            return responses;
        } catch (Exception e) {
            System.err.println("[OrderService] 获取用户历史订单异常: " + e.getMessage());
            throw new BusinessException(ExceptionCodeEnum.ORDER_GET_FAILED, "查询历史订单失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取司机的历史订单（已完成的订单）
     * @param driverId 司机ID
     * @return 订单详情列表
     */
    @Override
    public List<DriverOrderDetailResponse> getDriverHistoryOrders(Integer driverId) {
        System.out.println("[OrderService] 获取司机历史订单: driverId=" + driverId);
        
        try {
            // 查询司机已完成的订单（状态为3）
            List<Order> orders = orderRepository.findByDriverIdAndStatus(driverId, (byte) 3);
            
            // 转换为车主端专用的详细响应DTO
            List<DriverOrderDetailResponse> responses = new ArrayList<>();
            for (Order order : orders) {
                DriverOrderDetailResponse response = convertToDriverOrderDetailResponse(order);
                responses.add(response);
            }
            
            System.out.println("[OrderService] 获取司机历史订单完成，共找到 " + responses.size() + " 条记录");
            return responses;
        } catch (Exception e) {
            System.err.println("[OrderService] 获取司机历史订单异常: " + e.getMessage());
            throw new BusinessException(ExceptionCodeEnum.ORDER_GET_FAILED, "查询历史订单失败: " + e.getMessage());
        }
    }
    
    /**
     * 将Order实体转换为UserOrderDetailResponse DTO（用户端专用）
     * @param order 订单实体
     * @return 用户端订单详情响应DTO
     */
    private UserOrderDetailResponse convertToUserOrderDetailResponse(Order order) {
        UserOrderDetailResponse response = new UserOrderDetailResponse();
        response.setOrderId(order.getOrderId());
        response.setStartLocation(order.getStartLocation());
        response.setDestination(order.getDestination());
        response.setStatus(order.getStatus());
        response.setEstimatedPrice(order.getEstimatedPrice());
        response.setActualPrice(order.getActualPrice());
        response.setCreatedAt(order.getCreatedAt());
        response.setUpdatedAt(order.getUpdatedAt());
        response.setType(order.getType());
        
        // 获取司机信息（不包含手机号和钱包余额等敏感信息）
        if (order.getDriverId() != null) {
            Optional<Driver> driverOpt = driverRepository.findById(order.getDriverId());
            if (driverOpt.isPresent()) {
                Driver driver = driverOpt.get();
                UserOrderDetailResponse.DriverInfoDTO driverInfo = new UserOrderDetailResponse.DriverInfoDTO();
                driverInfo.setDriverId(driver.getDriverId());
                driverInfo.setUsername(driver.getUsername());
                driverInfo.setCreditScore(driver.getCreditScore());
                response.setDriver(driverInfo);
            }
        }
        
        // 获取车辆信息
        if (order.getVehicleId() != null) {
            Optional<Vehicle> vehicleOpt = vehicleRepository.findById(order.getVehicleId());
            if (vehicleOpt.isPresent()) {
                Vehicle vehicle = vehicleOpt.get();
                UserOrderDetailResponse.VehicleInfoDTO vehicleInfo = new UserOrderDetailResponse.VehicleInfoDTO();
                vehicleInfo.setVehicleId(vehicle.getVehicleId());
                vehicleInfo.setLicensePlate(vehicle.getLicensePlate());
                response.setVehicle(vehicleInfo);
            }
        }
        
        // 获取评价信息
        List<Review> reviews = reviewRepository.findByOrderId(order.getOrderId());
        if (!reviews.isEmpty()) {
            Review review = reviews.get(0); // 一个订单只应该有一个评价
            UserOrderDetailResponse.ReviewInfoDTO reviewInfo = new UserOrderDetailResponse.ReviewInfoDTO();
            reviewInfo.setReviewId(review.getReviewId());
            reviewInfo.setContent(review.getContent());
            reviewInfo.setCommentStar(review.getCommentStar());
            reviewInfo.setCreatedAt(review.getCreatedAt());
            reviewInfo.setUpdatedAt(review.getUpdatedAt());
            response.setReview(reviewInfo);
        }
        
        return response;
    }
    
    /**
     * 将Order实体转换为DriverOrderDetailResponse DTO（车主端专用）
     * @param order 订单实体
     * @return 车主端订单详情响应DTO
     */
    private DriverOrderDetailResponse convertToDriverOrderDetailResponse(Order order) {
        DriverOrderDetailResponse response = new DriverOrderDetailResponse();
        response.setOrderId(order.getOrderId());
        response.setStartLocation(order.getStartLocation());
        response.setDestination(order.getDestination());
        response.setStatus(order.getStatus());
        response.setEstimatedPrice(order.getEstimatedPrice());
        response.setActualPrice(order.getActualPrice());
        response.setCreatedAt(order.getCreatedAt());
        response.setUpdatedAt(order.getUpdatedAt());
        response.setType(order.getType());
        
        // 获取用户信息（不包含手机号等敏感信息）
        if (order.getUserId() != null) {
            Optional<User> userOpt = userRepository.findById(order.getUserId());
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                DriverOrderDetailResponse.UserInfoDTO userInfo = new DriverOrderDetailResponse.UserInfoDTO();
                userInfo.setUserId(user.getUserId());
                userInfo.setUsername(user.getUsername());
                response.setUser(userInfo);
            }
        }
        
        // 获取车辆信息
        if (order.getVehicleId() != null) {
            Optional<Vehicle> vehicleOpt = vehicleRepository.findById(order.getVehicleId());
            if (vehicleOpt.isPresent()) {
                Vehicle vehicle = vehicleOpt.get();
                DriverOrderDetailResponse.VehicleInfoDTO vehicleInfo = new DriverOrderDetailResponse.VehicleInfoDTO();
                vehicleInfo.setVehicleId(vehicle.getVehicleId());
                vehicleInfo.setLicensePlate(vehicle.getLicensePlate());
                response.setVehicle(vehicleInfo);
            }
        }
        
        // 获取评价信息
        List<Review> reviews = reviewRepository.findByOrderId(order.getOrderId());
        if (!reviews.isEmpty()) {
            Review review = reviews.get(0); // 一个订单只应该有一个评价
            DriverOrderDetailResponse.ReviewInfoDTO reviewInfo = new DriverOrderDetailResponse.ReviewInfoDTO();
            reviewInfo.setReviewId(review.getReviewId());
            reviewInfo.setContent(review.getContent());
            reviewInfo.setCommentStar(review.getCommentStar());
            reviewInfo.setCreatedAt(review.getCreatedAt());
            reviewInfo.setUpdatedAt(review.getUpdatedAt());
            response.setReview(reviewInfo);
        }
        
        return response;
    }

}