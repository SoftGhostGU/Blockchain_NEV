package com.autocrowd.backend.service.impl;

import com.autocrowd.backend.dto.driver.DriverOrderDetailResponse;
import com.autocrowd.backend.dto.order.*;
import com.autocrowd.backend.dto.driver.TurnoverDTO;
import com.autocrowd.backend.entity.*;
import com.autocrowd.backend.exception.BusinessException;
import com.autocrowd.backend.exception.ExceptionCodeEnum;
import com.autocrowd.backend.repository.*;
import com.autocrowd.backend.service.BlockchainService;
import com.autocrowd.backend.service.OrderService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private static final Logger logger = LoggerFactory.getLogger(OrderServiceImpl.class);

    private final OrderRepository orderRepository;
    private final DriverRepository driverRepository;
    private final VehicleRepository vehicleRepository;
    private final ReviewRepository reviewRepository;
    private final FinancialRepository financialRepository;
    private final UserRepository userRepository;
    
    @Autowired
    private BlockchainService blockchainService;
    
    // Helper method to generate a more realistic order ID
    private String generateOrderId() {
        // Generate order ID in the format ORD20250717001
        String datePart = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String randomPart = String.format("%03d", (new Random()).nextInt(1000));
        return "ORD" + datePart + randomPart;
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

            logger.info("[OrderService] 收到创建订单请求: 起点={}, 终点={}, 车辆类型={}", request.getStartLocation(), request.getDestination(), request.getVehicleType());

            // 生成订单ID (形如 ORD20250717001)
            String orderId = generateOrderId();

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
            logger.info("[OrderService] 订单创建成功: {}", savedOrder.getOrderId());

            return savedOrder;
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            logger.error("[OrderService] 创建订单异常: {}", e.getMessage(), e);
            throw new BusinessException(ExceptionCodeEnum.ORDER_CREATE_FAILED, "创建订单失败: " + e.getMessage());
        }
    }

    /**
     * 价格预估
     * @param request 预估请求参数
     * @return 预估价格信息
     */
    @Override
    public Map<String, Object> estimatePrice(EstimatePriceRequest request) {
        logger.info("[OrderService] 收到价格预估请求: 起点={}, 终点={}", request.getStartLocation(), request.getDestination());
        try {
            // 简单的距离计算（实际应使用地图API）
            // 由于缺少坐标信息，这里使用简单的字符串长度差作为示例计算
            double distance = Math.abs(request.getDestination().length() - request.getStartLocation().length()) * 2.0;

            // 简单的时间计算（假设速度为30公里/小时）
            double time = distance / 30 * 60; // 分钟

            // 计算价格（每公里2.5元）
            BigDecimal price = BigDecimal.valueOf(distance * 2.5).setScale(2, RoundingMode.HALF_UP); // 每公里2.5元

            Map<String, Object> result = new HashMap<>();
            result.put("distance", String.format("%.2f公里", distance));
            result.put("time", String.format("%.0f分钟", time));
            result.put("price", price);

            logger.info("[OrderService] 价格预估完成: 距离={}公里, 时间={}分钟, 价格={}元", distance, time, price);
            return result;
        } catch (Exception e) {
            logger.error("[OrderService] 价格预估异常: {}", e.getMessage(), e);
            throw new BusinessException(ExceptionCodeEnum.PRICE_ESTIMATION_FAILED, "价格预估失败: " + e.getMessage());
        }
    }

    /**
     * 获取用户当前订单
     * @param userId 用户ID
     * @return 当前订单响应DTO
     */
    @Override
    public CurrentOrderResponse getCurrentOrderByUserId(Integer userId) {
        try {
            // 查找所有正在进行的订单状态 (0=等待中, 1=已接单, 2=已接上客人)
            List<Byte> statuses = Arrays.asList((byte) 0, (byte) 1, (byte) 2);
            List<Order> allOrders = new ArrayList<>();
            for (Byte status : statuses) {
                allOrders.addAll(orderRepository.findByUserIdAndStatus(userId, status));
            }

            if (allOrders.isEmpty()) {
                return null; // 没有当前订单
            }

            // 返回第一个订单（通常一个用户只会有一个进行中的订单）
            Order order = allOrders.get(0);
            CurrentOrderResponse response = new CurrentOrderResponse();
            response.setOrderId(order.getOrderId());
            response.setStartLocation(order.getStartLocation());
            response.setDestination(order.getDestination());
            response.setStatus(order.getStatus());
            response.setEstimatedPrice(order.getEstimatedPrice());
            response.setCreatedAt(order.getCreatedAt());

            // 如果订单已被司机接单，查询司机和车辆信息
            if (order.getDriverId() != null) {
                Optional<Driver> driverOpt = driverRepository.findById(order.getDriverId());
                if (driverOpt.isPresent()) {
                    Driver driver = driverOpt.get();
                    CurrentOrderResponse.DriverInfoDTO driverInfo = new CurrentOrderResponse.DriverInfoDTO();
                    driverInfo.setDriverId(driver.getDriverId());
                    driverInfo.setUsername(driver.getUsername());
                    driverInfo.setPhone(driver.getPhone());

                    // 查询车辆信息
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

            return response;
        } catch (Exception e) {
            logger.error("[OrderService] 查询订单异常: {}", e.getMessage(), e);
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
        try {
            return orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException(ExceptionCodeEnum.ORDER_NOT_FOUND, "订单不存在"));
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            logger.error("[OrderService] 查询订单异常: {}", e.getMessage(), e);
            throw new BusinessException(ExceptionCodeEnum.ORDER_GET_FAILED, "查询订单失败: " + e.getMessage());
        }
    }

    /**
     * 更新订单状态
     * @param orderId 订单ID
     * @param status 新的状态
     * @return 更新后的订单
     */
    @Override
    public Order updateOrderStatus(String orderId, Byte status) {
        try {
            // 查找订单
            Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException(ExceptionCodeEnum.ORDER_NOT_FOUND, "订单不存在"));

            // 更新订单状态和更新时间
            order.setStatus(status);
            order.setUpdatedAt(LocalDateTime.now());

            // 保存订单
            Order updatedOrder = orderRepository.save(order);
            logger.info("[OrderService] 订单状态更新成功: {}", updatedOrder.getOrderId());

            return updatedOrder;
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            logger.error("[OrderService] 更新订单状态异常: {}", e.getMessage(), e);
            throw new BusinessException(ExceptionCodeEnum.ORDER_UPDATE_FAILED, "更新订单状态失败: " + e.getMessage());
        }
    }

    /**
     * 车主接单
     * @param orderId 订单ID
     * @param driverId 车主ID
     * @param vehicleId 车辆ID
     * @return 接单后的订单
     */
    @Override
    public Order acceptOrder(String orderId, Integer driverId, Integer vehicleId) {
        logger.info("[OrderService] 收到司机接单请求: 订单ID={}, 司机ID={}, 车辆ID={}", orderId, driverId, vehicleId);
        try {
            // 查找订单
            Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException(ExceptionCodeEnum.ORDER_NOT_FOUND, "订单不存在"));

            // 检查订单状态
            if (order.getStatus() != 0) {
                throw new BusinessException(ExceptionCodeEnum.ORDER_STATUS_ERROR, "订单状态不正确，无法接单");
            }

            // 更新订单信息
            order.setDriverId(driverId);
            order.setVehicleId(vehicleId);
            order.setStatus((byte) 1); // 1=On the way
            order.setUpdatedAt(LocalDateTime.now());

            // 保存订单
            Order updatedOrder = orderRepository.save(order);
            logger.info("[OrderService] 司机接单成功: {}", updatedOrder.getOrderId());

            return updatedOrder;
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            logger.error("[OrderService] 接单异常: {}", e.getMessage(), e);
            throw new BusinessException(ExceptionCodeEnum.ORDER_ACCEPT_FAILED, "接单失败: " + e.getMessage());
        }
    }

    /**
     * 车主完成订单
     * @param orderId 订单ID
     * @param actualPrice 实际价格
     * @return 完成的订单
     */
    @Override
    @Transactional
    public Order completeOrder(String orderId, BigDecimal actualPrice) {
        logger.info("[OrderService] 收到完成订单请求: 订单ID={}, 实际价格={}", orderId, actualPrice);
        try {
            // 查找订单
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new BusinessException(ExceptionCodeEnum.ORDER_NOT_FOUND, "订单不存在"));

            // 检查订单状态 (只有状态为2(已接上客人)的订单才能完成)
            if (order.getStatus() != 2) { // 2 = 已接上客人
                throw new BusinessException(ExceptionCodeEnum.ORDER_STATUS_ERROR, "订单状态不正确，无法完成");
            }

            // 更新订单状态和实际价格
            order.setStatus((byte) 3); // 3 = 已完成
            order.setActualPrice(actualPrice);
            order.setUpdatedAt(LocalDateTime.now());
            
            // 保存订单
            Order completedOrder = orderRepository.save(order);
            logger.info("[OrderService] 订单完成成功: {}", completedOrder.getOrderId());
            
            // 创建财务记录
            createFinancialRecords(order, actualPrice);
            
            // 将订单信息上链
            boolean orderOnChain = blockchainService.createOrderOnBlockchain(completedOrder);
            if (!orderOnChain) {
                logger.error("[OrderService] 订单信息上链失败: {}", completedOrder.getOrderId());
            }
            
            return completedOrder;
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            logger.error("[OrderService] 完成订单异常: {}", e.getMessage(), e);
            throw new BusinessException(ExceptionCodeEnum.ORDER_COMPLETE_FAILED, "完成订单失败: " + e.getMessage());
        }
    }
    
    /**
     * 为完成的订单创建财务记录
     * @param order 订单
     * @param actualPrice 实际价格
     */
    @Override
    public void createFinancialRecords(Order order, BigDecimal actualPrice) {
        try {
            logger.info("[OrderService] 为订单创建财务记录: 订单ID={}, 实际价格={}", order.getOrderId(), actualPrice);
            
            // 为用户创建支出记录
            Financial userFinancial = new Financial();
            userFinancial.setUserId(order.getUserId());
            userFinancial.setRole("User");
            userFinancial.setTransactionType(Financial.TransactionType.Expenses);
            userFinancial.setAmount(actualPrice);
            userFinancial.setTransactionTime(LocalDateTime.now());
            financialRepository.save(userFinancial);
            logger.info("[OrderService] 用户财务记录创建成功: ID={}", userFinancial.getFinancialId());
            
            // 为车主创建收入记录
            Financial driverFinancial = new Financial();
            driverFinancial.setUserId(order.getDriverId());
            driverFinancial.setRole("Driver");
            driverFinancial.setTransactionType(Financial.TransactionType.Earnings);
            driverFinancial.setAmount(actualPrice);
            driverFinancial.setTransactionTime(LocalDateTime.now());
            financialRepository.save(driverFinancial);
            logger.info("[OrderService] 车主财务记录创建成功: ID={}", driverFinancial.getFinancialId());
            
        } catch (Exception e) {
            logger.error("[OrderService] 创建财务记录异常: {}", e.getMessage(), e);
            // 财务记录创建失败不应影响订单完成，仅记录日志
        }
    }

    /**
     * 用户评价订单
     * @param request 添加评价请求DTO
     * @param userId 用户ID
     */
    @Override
    public Review addReview(AddReviewRequest request, Integer userId) {
        logger.info("[OrderService] 添加订单评价: orderId={}, userId={}", request.getOrderId(), userId);
        try {
            // 查找订单
            Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new BusinessException(ExceptionCodeEnum.ORDER_NOT_FOUND, "订单不存在"));

            // 检查订单状态是否为已完成
            if (order.getStatus() != 3) { // 3=Completed
                throw new BusinessException(ExceptionCodeEnum.ORDER_STATUS_ERROR, "只能对已完成的订单进行评价");
            }

            // 检查是否已评价
            List<Review> existingReviews = reviewRepository.findByOrderId(request.getOrderId());
            if (!existingReviews.isEmpty()) {
                throw new BusinessException(ExceptionCodeEnum.REVIEW_ALREADY_EXISTS, "该订单已评价");
            }

            // 创建评价
            Review review = new Review();
            review.setOrderId(request.getOrderId());
            review.setUserId(userId);
            review.setDriverId(order.getDriverId());
            review.setContent(request.getContent());
            review.setCommentStar(request.getCommentStar());
            review.setCreatedAt(LocalDateTime.now());
            review.setUpdatedAt(LocalDateTime.now());

            // 保存评价
            Review savedReview = reviewRepository.save(review);
            logger.info("[OrderService] 订单评价添加成功: {}", savedReview.getReviewId());

            return savedReview;
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            logger.error("[OrderService] 添加评价异常: {}", e.getMessage(), e);
            throw new BusinessException(ExceptionCodeEnum.REVIEW_CREATE_FAILED, "添加评价失败: " + e.getMessage());
        }
    }

    /**
     * 用户获取历史订单列表
     * @param userId 用户ID
     * @return 用户订单详情响应DTO列表
     */
    @Override
    public List<UserOrderDetailResponse> getUserHistoryOrders(Integer userId) {
        try {
            // 查找已完成的订单 (status=3)
            List<Order> orders = orderRepository.findByUserIdAndStatus(userId, (byte) 3);

            // 转换为响应DTO
            List<UserOrderDetailResponse> responses = new ArrayList<>();
            for (Order order : orders) {
                UserOrderDetailResponse response = convertToUserOrderDetailResponse(order);
                responses.add(response);
            }

            return responses;
        } catch (Exception e) {
            logger.error("[OrderService] 查询历史订单异常: {}", e.getMessage(), e);
            throw new BusinessException(ExceptionCodeEnum.ORDER_GET_FAILED, "查询历史订单失败: " + e.getMessage());
        }
    }

    /**
     * 车主获取历史订单列表
     * @param driverId 车主ID
     * @return 车主订单详情响应DTO列表
     */
    @Override
    public List<DriverOrderDetailResponse> getDriverHistoryOrders(Integer driverId) {
        try {
            // 查找已完成的订单 (status=3)
            List<Order> orders = orderRepository.findByDriverIdAndStatus(driverId, (byte) 3);

            // 转换为响应DTO
            List<DriverOrderDetailResponse> responses = new ArrayList<>();
            for (Order order : orders) {
                DriverOrderDetailResponse response = convertToDriverOrderDetailResponse(order);
                responses.add(response);
            }

            return responses;
        } catch (Exception e) {
            logger.error("[OrderService] 查询历史订单异常: {}", e.getMessage(), e);
            throw new BusinessException(ExceptionCodeEnum.ORDER_GET_FAILED, "查询历史订单失败: " + e.getMessage());
        }
    }

    /**
     * 将订单实体转换为用户订单详情响应DTO
     * @param order 订单实体
     * @return 用户订单详情响应DTO
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

        // 查询司机信息
        if (order.getDriverId() != null) {
            Optional<Driver> driverOpt = driverRepository.findById(order.getDriverId());
            if (driverOpt.isPresent()) {
                Driver driver = driverOpt.get();
                UserOrderDetailResponse.DriverInfoDTO driverInfo = new UserOrderDetailResponse.DriverInfoDTO();
                driverInfo.setDriverId(driver.getDriverId());
                driverInfo.setUsername(driver.getUsername());
                driverInfo.setCreditScore(driver.getCreditScore());

                // 查询车辆信息
                if (order.getVehicleId() != null) {
                    Optional<Vehicle> vehicleOpt = vehicleRepository.findById(order.getVehicleId());
                    if (vehicleOpt.isPresent()) {
                        Vehicle vehicle = vehicleOpt.get();
                        UserOrderDetailResponse.VehicleInfoDTO vehicleInfo = new UserOrderDetailResponse.VehicleInfoDTO();
                        vehicleInfo.setVehicleId(vehicle.getVehicleId());
                        vehicleInfo.setLicensePlate(vehicle.getLicensePlate());
                        // 移除对setVehicle方法的调用，因为DriverInfoDTO中没有这个方法
                        // driverInfo.setVehicle(vehicleInfo);
                    }
                }
                response.setDriver(driverInfo);
            }
        }

        // 查询评价信息
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
     * 将订单实体转换为车主订单详情响应DTO
     * @param order 订单实体
     * @return 车主订单详情响应DTO
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

        // 查询用户信息
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

        // 查询车辆信息
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

        // 查询评价信息
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

    @Override
    public TurnoverDTO getDriverRecent7DaysTurnover(Integer driverId) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime sevenDaysAgo = now.minusDays(6); // 包含今天，共7天数据

        // 从financial表中查询类型为Earnings的数据
        List<Financial> earnings = financialRepository.findByRoleAndUserIdAndTransactionTypeAndTransactionTimeBetween(
                "Driver", driverId, Financial.TransactionType.Earnings, sevenDaysAgo, now);

        // 计算总营业额
        BigDecimal totalTurnover = BigDecimal.ZERO;
        for (Financial financial : earnings) {
            totalTurnover = totalTurnover.add(financial.getAmount());
        }

        // 创建TurnoverDTO并返回
        TurnoverDTO dto = new TurnoverDTO();
        dto.setDay("最近7天");
        dto.setValue(totalTurnover);
        return dto;
    }

    @Override
    public TurnoverDTO getDriverRecent6MonthsTurnover(Integer driverId) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime sixMonthsAgo = now.minusMonths(5).withDayOfMonth(1).with(LocalDateTime.MIN.toLocalTime());

        // 从financial表中查询类型为Earnings的数据
        List<Financial> earnings = financialRepository.findByRoleAndUserIdAndTransactionTypeAndTransactionTimeBetween(
                "Driver", driverId, Financial.TransactionType.Earnings, sixMonthsAgo, now);

        // 计算总营业额
        BigDecimal totalTurnover = BigDecimal.ZERO;
        for (Financial financial : earnings) {
            totalTurnover = totalTurnover.add(financial.getAmount());
        }

        // 创建TurnoverDTO并返回
        TurnoverDTO dto = new TurnoverDTO();
        dto.setDay("最近6个月");
        dto.setValue(totalTurnover);
        return dto;
    }

    @Override
    public List<TurnoverDTO> getDriverTurnoverLast7Days(Integer driverId) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime sevenDaysAgo = now.minusDays(6); // 包含今天，共7天数据

        // 从financial表中查询类型为Earnings的数据
        List<Financial> earnings = financialRepository.findByRoleAndUserIdAndTransactionTypeAndTransactionTimeBetween(
                "Driver", driverId, Financial.TransactionType.Earnings, sevenDaysAgo, now);

        // 创建包含最近7天的Map
        Map<String, BigDecimal> dailyTurnover = new HashMap<>();
        for (int i = 0; i < 7; i++) {
            LocalDateTime date = sevenDaysAgo.plusDays(i);
            String dateStr = date.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            dailyTurnover.put(dateStr, BigDecimal.ZERO);
        }

        // 统计每天的营业额
        for (Financial financial : earnings) {
            String dateStr = financial.getTransactionTime().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            if (dailyTurnover.containsKey(dateStr)) {
                BigDecimal current = dailyTurnover.get(dateStr);
                dailyTurnover.put(dateStr, current.add(financial.getAmount()));
            }
        }

        // 转换为TurnoverDTO列表
        List<TurnoverDTO> result = new ArrayList<>();
        for (Map.Entry<String, BigDecimal> entry : dailyTurnover.entrySet()) {
            TurnoverDTO dto = new TurnoverDTO();
            dto.setDay(entry.getKey());
            dto.setValue(entry.getValue());
            result.add(dto);
        }

        // 按日期排序
        result.sort(Comparator.comparing(TurnoverDTO::getDay));
        return result;
    }

    @Override
    public List<TurnoverDTO> getDriverTurnoverLast7Months(Integer driverId) {
        LocalDateTime now = LocalDateTime.now();
        List<TurnoverDTO> result = new ArrayList<>();

        for (int i = 6; i >= 0; i--) {
            LocalDateTime monthStart = now.minusMonths(i).withDayOfMonth(1).with(LocalDateTime.MIN.toLocalTime());
            LocalDateTime monthEnd = monthStart.plusMonths(1).minusDays(1).with(LocalDateTime.MAX.toLocalTime());

            // 从financial表中查询类型为Earnings的数据
            List<Financial> earnings = financialRepository.findByRoleAndUserIdAndTransactionTypeAndTransactionTimeBetween(
                    "Driver", driverId, Financial.TransactionType.Earnings, monthStart, monthEnd);

            BigDecimal monthlyTurnover = BigDecimal.ZERO;
            for (Financial financial : earnings) {
                monthlyTurnover = monthlyTurnover.add(financial.getAmount());
            }

            TurnoverDTO dto = new TurnoverDTO();
            dto.setDay(monthStart.format(DateTimeFormatter.ofPattern("yyyy-MM")));
            dto.setValue(monthlyTurnover);
            result.add(dto);
        }

        return result;
    }
}