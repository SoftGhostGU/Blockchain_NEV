package com.autocrowd.backend.service.impl;

import com.autocrowd.backend.entity.Vehicle;
import com.autocrowd.backend.entity.Review;
import com.autocrowd.backend.exception.BusinessException;
import com.autocrowd.backend.exception.ExceptionCodeEnum;
import com.autocrowd.backend.repository.VehicleRepository;
import com.autocrowd.backend.repository.ReviewRepository;
import com.autocrowd.backend.service.VehicleAuditService;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * 车辆和评论审核服务实现类
 * 实现VehicleAuditService接口定义的审核业务逻辑
 */
@Service
@AllArgsConstructor
public class VehicleAuditServiceImpl implements VehicleAuditService {
    private static final Logger logger = LoggerFactory.getLogger(VehicleAuditServiceImpl.class);

    private final VehicleRepository vehicleRepository;
    private final ReviewRepository reviewRepository;

    /**
     * 审核车辆
     * 将车辆状态从待审核改为已通过
     *
     * @param vehicleId 车辆ID
     * @param status    审核状态 (2=已通过, 3=已拒绝)
     * @return 审核后的车辆信息
     */
    @Override
    public Vehicle auditVehicle(Long vehicleId, Byte status) {
        try {
            // 参数验证
            if (vehicleId == null) {
                throw new BusinessException(ExceptionCodeEnum.PARAM_NULL_ERROR, "车辆ID不能为空");
            }

            if (status == null || (status != 2 && status != 3)) {
                throw new BusinessException(ExceptionCodeEnum.PARAM_ERROR, "审核状态参数错误，只允许2(通过)或3(拒绝)");
            }

            // 查找车辆
            Vehicle vehicle = vehicleRepository.findById(Math.toIntExact(vehicleId))
                    .orElseThrow(() -> new BusinessException(ExceptionCodeEnum.VEHICLE_NOT_FOUND, "未找到指定车辆"));

            // 更新审核状态
            vehicle.setAuditStatus(status);
            vehicle.setUpdatedAt(LocalDateTime.now());

            // 保存并返回
            return vehicleRepository.save(vehicle);
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            logger.error("[VehicleAuditServiceImpl] 审核车辆时发生异常: {}", e.getMessage(), e);
            throw new BusinessException(ExceptionCodeEnum.SYSTEM_ERROR, "审核车辆失败: " + e.getMessage());
        }
    }

    /**
     * 审核评论
     * 将评论状态从待审核改为已通过或其他状态
     *
     * @param reviewId 评论ID
     * @param status   审核状态 (2=已通过, 3=已拒绝)
     * @return 审核后的评论信息
     */
    @Override
    public Review auditReview(Long reviewId, Byte status) {
        try {
            // 参数验证
            if (reviewId == null) {
                throw new BusinessException(ExceptionCodeEnum.PARAM_NULL_ERROR, "评论ID不能为空");
            }

            if (status == null || (status != 2 && status != 3)) {
                throw new BusinessException(ExceptionCodeEnum.PARAM_ERROR, "审核状态参数错误，只允许2(通过)或3(拒绝)");
            }

            // 查找评论
            Review review = reviewRepository.findById(Math.toIntExact(reviewId))
                    .orElseThrow(() -> new BusinessException(ExceptionCodeEnum.PARAM_ERROR, "未找到指定评论"));

            // 更新审核状态
            review.setAuditStatus(status);
            review.setUpdatedAt(LocalDateTime.now());

            // 保存并返回
            return reviewRepository.save(review);
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            logger.error("[VehicleAuditServiceImpl] 审核评论时发生异常: {}", e.getMessage(), e);
            throw new BusinessException(ExceptionCodeEnum.SYSTEM_ERROR, "审核评论失败: " + e.getMessage());
        }
    }
}