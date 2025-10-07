package com.autocrowd.backend.service;

import java.util.List;

import com.autocrowd.backend.dto.vehicle.VehicleCreateRequest;
import com.autocrowd.backend.dto.vehicle.VehicleDTO;
import com.autocrowd.backend.dto.vehicle.VehicleConditionResponse;
import com.autocrowd.backend.dto.vehicle.VehicleUpdateRequest;
import com.autocrowd.backend.entity.VehicleCondition;

/**
 * 车辆服务接口
 * 定义车辆相关业务逻辑的操作规范，作为服务层的核心接口
 */
public interface VehicleService {

    /**
     * 创建新车辆
     * 接收车辆信息并保存到数据库，完成车辆注册业务逻辑
     * @param request 包含车辆信息的请求DTO
     * @return 包含新创建车辆信息的响应DTO
     */
    VehicleDTO createVehicle(Integer driverId, VehicleCreateRequest request);
    VehicleDTO updateVehicle(Integer driverId, VehicleUpdateRequest request);
    List<VehicleDTO> getVehiclesByDriverId(Integer driverId);
    
    /**
     * 删除车辆
     * 根据车辆ID删除指定车辆，需要验证司机权限
     * @param driverId 司机ID
     * @param vehicleId 车辆ID
     * @return 删除结果
     */
    boolean deleteVehicle(Integer driverId, Integer vehicleId);

    /**
     * 验证车辆是否属于指定司机
     * @param vehicleId 车辆ID
     * @param driverId 司机ID
     * @return 如果车辆属于司机返回true，否则返回false
     */
    boolean isVehicleBelongsToDriver(Integer vehicleId, Integer driverId);
    
    /**
     * 根据车辆ID获取车辆状况信息
     * @param vehicleId 车辆ID
     * @return 车辆状况响应DTO，包含车辆状况信息和来自Vehicle表的相关字段
     */
    VehicleConditionResponse getVehicleConditionByVehicleId(Integer vehicleId);
    
    /**
     * 更新车辆状态
     * @param driverId 司机ID
     * @param vehicleId 车辆ID
     * @param status 车辆状态
     * @return 更新后的车辆DTO
     */
    VehicleDTO updateVehicleStatus(Integer driverId, Integer vehicleId, Byte status);
}