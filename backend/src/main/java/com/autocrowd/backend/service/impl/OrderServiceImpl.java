package com.autocrowd.backend.service.impl;

import com.autocrowd.backend.dto.driver.DriverOrderDetailResponse;
import com.autocrowd.backend.dto.order.*;
import com.autocrowd.backend.dto.driver.TurnoverDTO;
import com.autocrowd.backend.dto.financial.WithdrawableBalanceDTO;
import com.autocrowd.backend.dto.vehicle.VehicleDTO;
import com.autocrowd.backend.entity.*;
import com.autocrowd.backend.enums.OrderTypeEnum;
import com.autocrowd.backend.enums.VehicleStatusEnum;
import com.autocrowd.backend.exception.BusinessException;
import com.autocrowd.backend.exception.ExceptionCodeEnum;
import com.autocrowd.backend.repository.*;
import com.autocrowd.backend.service.BlockchainService;
import com.autocrowd.backend.service.OrderService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private static final Logger logger = LoggerFactory.getLogger(OrderServiceImpl.class);

    private final OrderRepository orderRepository;
    private final ReviewRepository reviewRepository;
    private final VehicleRepository vehicleRepository;
    private final VehicleConditionRepository vehicleConditionRepository;
    private final DriverRepository driverRepository;
    private final UserRepository userRepository;
    private final FinancialRepository financialRepository;

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
     *
     * @param request 创建订单请求DTO
     * @param userId  用户ID
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

            logger.info("[OrderService] 收到创建订单请求: 起点={}, 终点={}, 类型={}", request.getStartLocation(), request.getDestination(), request.getType());

            // 生成订单ID (形如 ORD20250717001)
            String orderId = generateOrderId();

            // 创建订单实体
            Order order = new Order();
            order.setOrderId(orderId);
            order.setUserId(Integer.valueOf(userId));
            // 直接存储前端传来的加密数据
            order.setStartLocation(request.getStartLocation());
            order.setDestination(request.getDestination());
            order.setEstimatedPrice(request.getEstimatedPrice());
            order.setType(request.getType());
            order.setEstimatedTime(request.getEstimatedTime());
            order.setStatus((byte) 0); // 0=Pending
            order.setCreatedAt(LocalDateTime.now());
            order.setUpdatedAt(LocalDateTime.now());

            // 设置访问策略，允许用户访问
            String accessPolicy = "(USER_" + userId + ")";
            order.setAccessPolicy(accessPolicy);

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
     *
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
     *
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
                            vehicleInfo.setStatus(vehicle.getStatus()); // 添加车辆状态
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
     *
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
     *
     * @param orderId 订单ID
     * @param status  新的状态
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
     * 用户选择车辆来接单
     *
     * @param request 选择车辆请求DTO
     * @param userId  用户ID
     * @return 更新后的订单
     */
    @Override
    public Order selectVehicleForOrder(SelectVehicleRequest request, Integer userId) {
        logger.info("[OrderService] 收到用户选择车辆请求: 订单ID={}, 车辆ID={}", request.getOrderId(), request.getVehicleId());
        try {
            // 查找订单
            Order order = orderRepository.findById(request.getOrderId())
                    .orElseThrow(() -> new BusinessException(ExceptionCodeEnum.ORDER_NOT_FOUND, "订单不存在"));

            // 检查订单是否属于该用户
            if (!order.getUserId().equals(userId)) {
                throw new BusinessException(ExceptionCodeEnum.PERMISSION_DENIED, "订单不属于当前用户");
            }

            // 检查订单状态
            if (order.getStatus() != 0) {
                throw new BusinessException(ExceptionCodeEnum.ORDER_STATUS_ERROR, "订单状态不正确，无法选择车辆");
            }

            // 检查车辆是否通过审核
            Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                    .orElseThrow(() -> new BusinessException(ExceptionCodeEnum.VEHICLE_NOT_FOUND, "车辆不存在"));

            if (vehicle.getAuditStatus() == null || vehicle.getAuditStatus() != 2) {
                throw new BusinessException(ExceptionCodeEnum.VEHICLE_NOT_AUDITED, "车辆未通过审核，无法选择");
            }
            
            // 检查车辆是否可接单
            if (vehicle.getStatus() == null || vehicle.getStatus() != 1) {
                throw new BusinessException(ExceptionCodeEnum.VEHICLE_NOT_AUDITED, "车辆当前不可接单");
            }

            // 获取车主信息
            Driver driver = driverRepository.findById(vehicle.getDriverId())
                    .orElseThrow(() -> new BusinessException(ExceptionCodeEnum.DRIVER_NOT_FOUND, "车主不存在"));

            // 更新订单信息
            order.setDriverId(driver.getDriverId());
            order.setVehicleId(request.getVehicleId());
            // 车主派遣车辆后，将订单状态更新为1（已接单）
            order.setStatus((byte) 1);
            order.setUpdatedAt(LocalDateTime.now());

            // 设置用户偏好和位置信息
            order.setUserCredit(request.getUserCredit());
            order.setUserPrefQuiet(request.getUserPrefQuiet());
            order.setUserPrefSpeed(request.getUserPrefSpeed());
            order.setUserPrefCarType(request.getUserPrefCarType());
            order.setStartLat(request.getStartLat());
            order.setStartLon(request.getStartLon());
            order.setDestLat(request.getDestLat());
            order.setDestLon(request.getDestLon());

            // 更新访问策略，允许车主访问
            String currentPolicy = order.getAccessPolicy();
            if (currentPolicy != null && !currentPolicy.isEmpty()) {
                // 将策略从 "(USER_1)" 更新为 "(USER_1) OR (DRIVER_2)" 的形式
                String updatedPolicy = currentPolicy + " OR (DRIVER_" + driver.getDriverId() + ")";
                order.setAccessPolicy(updatedPolicy);
            } else {
                // 如果没有现有策略，则创建新的策略
                String newPolicy = "(DRIVER_" + driver.getDriverId() + ")";
                order.setAccessPolicy(newPolicy);
            }

            // 保存订单
            Order updatedOrder = orderRepository.save(order);
            logger.info("[OrderService] 用户选择车辆成功: {}", updatedOrder.getOrderId());

            return updatedOrder;
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            logger.error("[OrderService] 用户选择车辆异常: {}", e.getMessage(), e);
            throw new BusinessException(ExceptionCodeEnum.ORDER_ACCEPT_FAILED, "选择车辆失败: " + e.getMessage());
        }
    }

    /**
     * 车主接单并派遣车辆
     *
     * @param orderId   订单ID
     * @param driverId  车主ID
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

            // 检查车辆是否通过审核
            Vehicle vehicle = vehicleRepository.findById(vehicleId)
                    .orElseThrow(() -> new BusinessException(ExceptionCodeEnum.VEHICLE_NOT_FOUND, "车辆不存在"));

            if (vehicle.getAuditStatus() == null || vehicle.getAuditStatus() != 2) {
                throw new BusinessException(ExceptionCodeEnum.VEHICLE_NOT_AUDITED, "车辆未通过审核，无法接单");
            }
            
            // 检查车辆是否可接单
            if (vehicle.getStatus() == null || vehicle.getStatus() != 1) {
                throw new BusinessException(ExceptionCodeEnum.VEHICLE_NOT_AUDITED, "车辆当前不可接单");
            }

            // 更新订单信息
            order.setDriverId(driverId);
            order.setVehicleId(vehicleId);
            order.setStatus((byte) 1); // 1=已接单（车主已派遣车辆）
            order.setUpdatedAt(LocalDateTime.now());

            // 更新访问策略，允许车主访问
            String currentPolicy = order.getAccessPolicy();
            if (currentPolicy != null && !currentPolicy.isEmpty()) {
                // 将策略从 "(USER_1)" 更新为 "(USER_1) OR (DRIVER_2)" 的形式
                String updatedPolicy = currentPolicy + " OR (DRIVER_" + driverId + ")";
                order.setAccessPolicy(updatedPolicy);
            } else {
                // 如果没有现有策略，则创建新的策略
                String newPolicy = "(DRIVER_" + driverId + ")";
                order.setAccessPolicy(newPolicy);
            }

            // 保存订单
            Order updatedOrder = orderRepository.save(order);
            logger.info("[OrderService] 司机接单并派遣车辆成功: {}", updatedOrder.getOrderId());

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
     *
     * @param orderId     订单ID
     * @param actualPrice 实际价格（已加密）
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
            // 直接存储前端传来的加密数据
            order.setActualPrice(actualPrice);
            // 这里我们假设实际时间与预计时间相同，实际项目中可能需要根据真实情况设置
            order.setActualTime(order.getEstimatedTime());
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
     * 用户完成订单
     *
     * @param orderId     订单ID
     * @param actualPrice 实际价格（已加密）
     * @param userId      用户ID
     * @return 完成的订单
     */
    @Override
    @Transactional
    public Order completeOrderByUser(String orderId, BigDecimal actualPrice, Integer userId) {
        logger.info("[OrderService] 收到用户完成订单请求: 订单ID={}, 实际价格={}, 用户ID={}", orderId, actualPrice, userId);
        try {
            // 查找订单
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new BusinessException(ExceptionCodeEnum.ORDER_NOT_FOUND, "订单不存在"));

            // 检查订单是否属于该用户
            if (!order.getUserId().equals(userId)) {
                throw new BusinessException(ExceptionCodeEnum.PERMISSION_DENIED, "订单不属于当前用户");
            }

            // 检查订单状态 (只有状态为2(已接上客人)的订单才能完成)
            if (order.getStatus() != 2) { // 2 = 已接上客人
                throw new BusinessException(ExceptionCodeEnum.ORDER_STATUS_ERROR, "订单状态不正确，无法完成");
            }

            // 更新订单状态和实际价格
            order.setStatus((byte) 3); // 3 = 已完成
            // 直接存储前端传来的加密数据
            order.setActualPrice(actualPrice);
            // 这里我们假设实际时间与预计时间相同，实际项目中可能需要根据真实情况设置
            order.setActualTime(order.getEstimatedTime());
            order.setUpdatedAt(LocalDateTime.now());

            // 保存订单
            Order completedOrder = orderRepository.save(order);
            logger.info("[OrderService] 用户完成订单成功: {}", completedOrder.getOrderId());

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
            logger.error("[OrderService] 用户完成订单异常: {}", e.getMessage(), e);
            throw new BusinessException(ExceptionCodeEnum.ORDER_COMPLETE_FAILED, "完成订单失败: " + e.getMessage());
        }
    }

    /**
     * 为完成的订单创建财务记录
     *
     * @param order       订单
     * @param actualPrice 实际价格
     */
    @Override
    @Transactional
    public void createFinancialRecords(Order order, BigDecimal actualPrice) {
        try {
            logger.info("[OrderService] 为订单创建财务记录: 订单ID={}, 实际价格={}", order.getOrderId(), actualPrice);

            // 获取用户和车主信息
            User user = userRepository.findById(order.getUserId())
                    .orElseThrow(() -> new BusinessException(ExceptionCodeEnum.USER_NOT_FOUND, "用户不存在"));
            Driver driver = driverRepository.findById(order.getDriverId())
                    .orElseThrow(() -> new BusinessException(ExceptionCodeEnum.DRIVER_NOT_FOUND, "车主不存在"));

            // 更新用户余额（减少）
            if (user.getBalance() == null) {
                user.setBalance(BigDecimal.ZERO);
            }
            user.setBalance(user.getBalance().subtract(actualPrice));
            user.setUpdatedAt(LocalDateTime.now());
            userRepository.save(user);
            logger.info("[OrderService] 用户余额更新成功: 用户ID={}, 新余额={}", user.getUserId(), user.getBalance());

            // 更新车主余额（增加）
            if (driver.getWalletBalance() == null) {
                driver.setWalletBalance(BigDecimal.ZERO);
            }
            driver.setWalletBalance(driver.getWalletBalance().add(actualPrice));
            driver.setUpdatedAt(LocalDateTime.now());
            driverRepository.save(driver);
            logger.info("[OrderService] 车主余额更新成功: 车主ID={}, 新余额={}", driver.getDriverId(), driver.getWalletBalance());

            // 为用户创建支出记录
            Financial userFinancial = new Financial();
            userFinancial.setUserId(order.getUserId());
            userFinancial.setRole("user");
            userFinancial.setTransactionType(Financial.TransactionType.Expenses);
            userFinancial.setAmount(actualPrice);
            userFinancial.setTransactionTime(LocalDateTime.now());
            financialRepository.save(userFinancial);
            logger.info("[OrderService] 用户财务记录创建成功: ID={}", userFinancial.getFinancialId());

            boolean userTransactionOnBlockchain = blockchainService.createUserTransactionOnBlockchain(userFinancial);
            if (!userTransactionOnBlockchain) {
                logger.error("[OrderService] 用户财务记录上链失败: {}", userFinancial.getFinancialId());
            } else {
                logger.info("[OrderService] 用户财务记录上链成功: ID={}", userFinancial.getFinancialId());
            }

            // 为车主创建收入记录
            Financial driverFinancial = new Financial();
            driverFinancial.setUserId(order.getDriverId());
            driverFinancial.setRole("driver");
            driverFinancial.setTransactionType(Financial.TransactionType.Earnings);
            driverFinancial.setAmount(actualPrice);
            driverFinancial.setTransactionTime(LocalDateTime.now());
            financialRepository.save(driverFinancial);
            logger.info("[OrderService] 车主财务记录创建成功: ID={}", driverFinancial.getFinancialId());

            boolean driverTransactionOnBlockchain = blockchainService.createDriverTransactionOnBlockchain(driverFinancial);
            if (!driverTransactionOnBlockchain) {
                logger.error("[OrderService] 车主财务记录上链失败: {}", driverFinancial.getFinancialId());
            } else {
                logger.info("[OrderService] 车主财务记录创建成功: ID={}", driverFinancial.getFinancialId());
            }


        } catch (Exception e) {
            logger.error("[OrderService] 创建财务记录异常: {}", e.getMessage(), e);
            throw new BusinessException(ExceptionCodeEnum.FINANCIAL_RECORD_CREATION_FAILED, "创建财务记录失败: " + e.getMessage());
        }
    }

    /**
     * 用户评价订单
     *
     * @param request 添加评价请求DTO
     * @param userId  用户ID
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
            review.setAuditStatus((byte) 1); // 默认审核状态为1（待审核）
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
     *
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
     *
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
     *
     * @param order 订单实体
     * @return 用户订单详情响应DTO
     */
    private UserOrderDetailResponse convertToUserOrderDetailResponse(Order order) {
        UserOrderDetailResponse response = new UserOrderDetailResponse();

        // 设置基本订单信息
        response.setOrderId(order.getOrderId());

        // 格式化下单时间
        if (order.getCreatedAt() != null) {
            response.setOrderTime(order.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        }

        // 设置订单类型
        response.setOrderType("网约车");

        // 设置余额变动信息（仅保留数值）
        if (order.getActualPrice() != null) {
            response.setBalance(order.getActualPrice());
        } else if (order.getEstimatedPrice() != null) {
            response.setBalance(order.getEstimatedPrice());
        }

        // 设置订单状态文字描述
        response.setStatus(getStatusDescription(order.getStatus()));

        // 设置位置信息
        response.setStartLocation(order.getStartLocation());
        response.setEndLocation(order.getDestination());

        // 查询用户信息
        if (order.getUserId() != null) {
            Optional<User> userOpt = userRepository.findById(order.getUserId());
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                response.setUsername(user.getUsername());
            }
        }

        // 查询评价信息
        List<Review> reviews = reviewRepository.findByOrderId(order.getOrderId());
        if (!reviews.isEmpty()) {
            Review review = reviews.get(0);
            response.setCommentStar(review.getCommentStar());
            response.setCommentText(review.getContent());

            // 设置评价详情对象
            UserOrderDetailResponse.ReviewInfoDTO reviewInfo = new UserOrderDetailResponse.ReviewInfoDTO();
            reviewInfo.setReviewId(review.getReviewId());
            reviewInfo.setContent(review.getContent());
            reviewInfo.setCommentStar(review.getCommentStar());
            reviewInfo.setCreatedAt(review.getCreatedAt());
            reviewInfo.setUpdatedAt(review.getUpdatedAt());
            response.setReview(reviewInfo);
        } else {
            // 没有评价时设置默认值
            response.setCommentStar(BigDecimal.ZERO);
            response.setCommentText("");
        }

        // 保留原有字段用于向后兼容
        response.setDestination(order.getDestination());
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
                response.setDriver(driverInfo);
            }
        }

        return response;
    }

    /**
     * 获取订单状态的文字描述
     *
     * @param status 状态码
     * @return 状态描述
     */
    private String getStatusDescription(Byte status) {
        if (status == null) {
            return "未知";
        }
        switch (status) {
            case 0:
                return "等待中";
            case 1:
                return "已接单";
            case 2:
                return "进行中";
            case 3:
                return "已完成";
            case 4:
                return "已取消";
            default:
                return "未知";
        }
    }

    /**
     * 将订单实体转换为车主订单详情响应DTO
     *
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

    private OrderDTO convertToDTO(Order order) {
        OrderDTO dto = new OrderDTO();
        dto.setOrderId(order.getOrderId());
        dto.setUserId(order.getUserId());
        dto.setDriverId(order.getDriverId());
        dto.setVehicleId(order.getVehicleId());
        dto.setStartLocation(order.getStartLocation());
        dto.setDestination(order.getDestination());
        dto.setStatus(order.getStatus());
        dto.setEstimatedPrice(order.getEstimatedPrice());
        dto.setActualPrice(order.getActualPrice());
        dto.setType(order.getType());
        dto.setEstimatedTime(order.getEstimatedTime());
        dto.setActualTime(order.getActualTime());
        dto.setCreatedAt(order.getCreatedAt());
        dto.setUpdatedAt(order.getUpdatedAt());
        return dto;
    }

    @Override
    public TurnoverDTO getDriverRecent7DaysTurnover(Integer driverId) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime sevenDaysAgo = now.minusDays(6); // 包含今天，共7天数据

        // 从financial表中查询类型为Earnings的数据
        List<Financial> earnings = financialRepository.findByRoleAndUserIdAndTransactionTypeAndTransactionTimeBetween(
                "driver", driverId, Financial.TransactionType.Earnings, sevenDaysAgo, now);

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
                "driver", driverId, Financial.TransactionType.Earnings, sixMonthsAgo, now);

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
                "driver", driverId, Financial.TransactionType.Earnings, sevenDaysAgo, now);

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
                    "driver", driverId, Financial.TransactionType.Earnings, monthStart, monthEnd);

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

    @Override
    public List<OrderTypeDistributionDTO> getMonthlyOrderTypeDistribution(Integer userId, String role) {
        try {
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime monthStart = now.withDayOfMonth(1).with(LocalDateTime.MIN.toLocalTime());
            LocalDateTime monthEnd = now.withDayOfMonth(now.toLocalDate().lengthOfMonth()).with(LocalDateTime.MAX.toLocalTime());

            List<Order> orders;
            if ("driver".equals(role)) {
                // 只统计已完成的订单 (status=3)
                orders = orderRepository.findByDriverIdAndStatusAndCreatedAtBetween(userId, (byte) 3, monthStart, monthEnd);
            } else {
                // 只统计已完成的订单 (status=3)
                orders = orderRepository.findByUserIdAndStatusAndCreatedAtBetween(userId, (byte) 3, monthStart, monthEnd);
            }

            // 统计每种类型的数量
            Map<String, Long> typeCountMap = new HashMap<>();
            for (OrderTypeEnum type : OrderTypeEnum.values()) {
                typeCountMap.put(type.getDescription(), 0L);
            }

            for (Order order : orders) {
                String orderType = order.getType() != null ? order.getType() : "网约车";
                typeCountMap.put(orderType, typeCountMap.getOrDefault(orderType, 0L) + 1);
            }

            List<OrderTypeDistributionDTO> result = new ArrayList<>();
            for (Map.Entry<String, Long> entry : typeCountMap.entrySet()) {
                result.add(new OrderTypeDistributionDTO(entry.getKey(), entry.getValue()));
            }

            return result;
        } catch (Exception e) {
            logger.error("[获取订单类型分布异常]: {}", e.getMessage(), e);
            throw new BusinessException(ExceptionCodeEnum.ORDER_GET_FAILED, "获取订单类型分布失败: " + e.getMessage());
        }
    }

    @Override
    public List<StarDistributionDTO> getStarDistribution(Integer userId, String role) {
        try {
            List<Review> reviews;
            if ("driver".equals(role)) {
                reviews = reviewRepository.findByDriverId(userId);
            } else {
                reviews = reviewRepository.findByUserId(userId);
            }

            // 统计每个星级的数量
            Map<Integer, Long> starCountMap = new HashMap<>();
            for (int i = 1; i <= 5; i++) {
                starCountMap.put(i, 0L);
            }

            for (Review review : reviews) {
                if (review.getCommentStar() != null) {
                    int star = review.getCommentStar().intValue();
                    if (star >= 1 && star <= 5) {
                        starCountMap.put(star, starCountMap.get(star) + 1);
                    }
                }
            }

            List<StarDistributionDTO> result = new ArrayList<>();
            for (Map.Entry<Integer, Long> entry : starCountMap.entrySet()) {
                result.add(new StarDistributionDTO(entry.getKey(), entry.getValue()));
            }

            // 按星级降序排列 (5星到1星)
            result.sort((a, b) -> b.getStar().compareTo(a.getStar()));
            return result;
        } catch (Exception e) {
            logger.error("[获取评价分布异常]: {}", e.getMessage(), e);
            throw new BusinessException(ExceptionCodeEnum.ORDER_GET_FAILED, "获取评价分布失败: " + e.getMessage());
        }
    }

    @Override
    public WithdrawableBalanceDTO getWithdrawableBalance(Integer userId, String role) {
        try {
            BigDecimal totalBalance = BigDecimal.ZERO;

            if ("driver".equals(role)) {
                Optional<Driver> driverOpt = driverRepository.findById(userId);
                if (driverOpt.isPresent()) {
                    Driver driver = driverOpt.get();
                    totalBalance = driver.getWalletBalance() != null ? driver.getWalletBalance() : BigDecimal.ZERO;
                }
            } else {
                Optional<User> userOpt = userRepository.findById(userId);
                if (userOpt.isPresent()) {
                    User user = userOpt.get();
                    totalBalance = user.getBalance() != null ? user.getBalance() : BigDecimal.ZERO;
                }
            }

            // 可提现余额就是总余额，不需要考虑冻结余额
            BigDecimal withdrawableBalance = totalBalance;
            return new WithdrawableBalanceDTO(withdrawableBalance, totalBalance);
        } catch (Exception e) {
            logger.error("[获取可提现余额异常]: {}", e.getMessage(), e);
            throw new BusinessException(ExceptionCodeEnum.ORDER_GET_FAILED, "获取可提现余额失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取可接单的车辆列表
     * @return 可接单车辆列表
     */
    @Override
    public List<VehicleDTO> getAvailableVehicles() {
        try {
            // 查询审核通过且状态为可接单的车辆
            List<Vehicle> vehicles = vehicleRepository.findByAuditStatusAndStatus((byte) 2, (byte) 1);
            
            // 转换为DTO
            return vehicles.stream()
                    .map(this::convertVehicleToDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            logger.error("[OrderService] 查询可用车辆异常: {}", e.getMessage(), e);
            throw new BusinessException(ExceptionCodeEnum.VEHICLE_QUERY_ERROR, "查询可用车辆失败: " + e.getMessage());
        }
    }
    
    /**
     * 取消订单
     * @param orderId 订单ID
     * @param userId 用户ID
     * @return 取消的订单
     */
    @Override
    public Order cancelOrder(String orderId, Integer userId) {
        logger.info("[OrderService] 收到取消订单请求: 订单ID={}, 用户ID={}", orderId, userId);
        try {
            // 查找订单
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new BusinessException(ExceptionCodeEnum.ORDER_NOT_FOUND, "订单不存在"));

            // 检查订单是否属于该用户
            if (!order.getUserId().equals(userId)) {
                throw new BusinessException(ExceptionCodeEnum.PERMISSION_DENIED, "订单不属于当前用户");
            }

            // 检查订单状态 (只有状态为0(等待中)或1(已接单)的订单才能取消)
            if (order.getStatus() != 0 && order.getStatus() != 1) {
                throw new BusinessException(ExceptionCodeEnum.ORDER_STATUS_ERROR, "订单状态不正确，无法取消");
            }

            // 更新订单状态为4（已取消）
            order.setStatus((byte) 4);
            order.setUpdatedAt(LocalDateTime.now());

            // 保存订单
            Order cancelledOrder = orderRepository.save(order);
            logger.info("[OrderService] 订单取消成功: {}", cancelledOrder.getOrderId());

            return cancelledOrder;
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            logger.error("[OrderService] 取消订单异常: {}", e.getMessage(), e);
            throw new BusinessException(ExceptionCodeEnum.ORDER_CANCEL_FAILED, "取消订单失败: " + e.getMessage());
        }
    }
    
    /**
     * 将车辆实体转换为DTO
     * @param vehicle 车辆实体
     * @return 车辆DTO
     */
    private VehicleDTO convertVehicleToDTO(Vehicle vehicle) {
        VehicleDTO dto = new VehicleDTO();
        BeanUtils.copyProperties(vehicle, dto);
        
        // 查询并填充车辆状况信息
        if (vehicle.getConditionId() != null) {
            try {
                VehicleCondition condition = vehicleConditionRepository.findById(vehicle.getConditionId()).orElse(null);
                if (condition != null) {
                    dto.setVehicleModel(condition.getVehicleModel());
                    dto.setBatteryPercent(condition.getBatteryPercent());
                    dto.setMilesToGo(condition.getMilesToGo());
                    // 将数字状态转换为文字描述
                    dto.setBodyState(VehicleStatusEnum.fromCode(condition.getBodyState().intValue()).getDescription());
                    dto.setTirePressure(VehicleStatusEnum.fromCode(condition.getTirePressure().intValue()).getDescription());
                    dto.setBrakeState(VehicleStatusEnum.fromCode(condition.getBrakeState().intValue()).getDescription());
                    dto.setPowerState(VehicleStatusEnum.fromCode(condition.getPowerState().intValue()).getDescription());
                }
            } catch (Exception e) {
                logger.warn("[OrderService] 获取车辆状况信息失败: {}", e.getMessage());
                // 如果获取失败，设置默认值
                dto.setVehicleModel("未知");
                dto.setBatteryPercent((byte) 0);
                dto.setMilesToGo("0公里");
                dto.setBodyState("未知");
                dto.setTirePressure("未知");
                dto.setBrakeState("未知");
                dto.setPowerState("未知");
            }
        }
        
        return dto;
    }
}