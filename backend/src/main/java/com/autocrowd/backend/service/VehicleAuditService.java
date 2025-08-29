package com.autocrowd.backend.service;

import com.autocrowd.backend.entity.Vehicle;
import com.autocrowd.backend.entity.Review;

/**
 * 车辆和评论审核服务接口
 * 提供车辆和评论的审核功能
 */
public interface VehicleAuditService {
    /**
     * 审核车辆
     * 将车辆状态从待审核改为已通过
     *
     * @param vehicleId 车辆ID
     * @param status 审核状态 (2=已通过, 3=已拒绝)
     * @return 审核后的车辆信息
     */
    Vehicle auditVehicle(Long vehicleId, Byte status);

    /**
     * 审核评论
     * 将评论状态从待审核改为已通过或其他状态
     *
     * @param reviewId 评论ID
     * @param status 审核状态 (2=已通过, 3=已拒绝)
     * @return 审核后的评论信息
     */
    Review auditReview(Long reviewId, Byte status);
}