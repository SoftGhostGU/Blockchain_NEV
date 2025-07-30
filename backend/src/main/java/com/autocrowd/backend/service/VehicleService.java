package com.autocrowd.backend.service;

import com.autocrowd.backend.dto.VehicleCreateRequest;
import com.autocrowd.backend.dto.VehicleUpdateRequest;
import com.autocrowd.backend.dto.VehicleDTO;
import java.util.List;

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
}