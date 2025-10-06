package com.autocrowd.backend.util;

import com.autocrowd.backend.dto.vehicle.VehicleDTO;
import com.autocrowd.backend.entity.Vehicle;
import com.autocrowd.backend.entity.VehicleCondition;
import com.autocrowd.backend.enums.VehicleStatusEnum;
import com.autocrowd.backend.repository.VehicleConditionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;

/**
 * 车辆相关工具类
 * 提供通用的车辆数据转换方法，避免代码重复
 */
public class VehicleUtils {
    
    private static final Logger logger = LoggerFactory.getLogger(VehicleUtils.class);
    
    /**
     * 将车辆实体转换为DTO
     * @param vehicle 车辆实体
     * @param vehicleConditionRepository 车辆状况仓库
     * @return 车辆DTO
     */
    public static VehicleDTO convertToDTO(Vehicle vehicle, VehicleConditionRepository vehicleConditionRepository) {
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
                } else {
                    setDefaultValues(dto);
                }
            } catch (Exception e) {
                logger.warn("[VehicleUtils] 获取车辆状况信息失败: {}", e.getMessage());
                setDefaultValues(dto);
            }
        } else {
            setDefaultValues(dto);
        }
        
        return dto;
    }
    
    /**
     * 设置默认值
     * @param dto 车辆DTO
     */
    private static void setDefaultValues(VehicleDTO dto) {
        dto.setVehicleModel("未知");
        dto.setBatteryPercent((byte) 0);
        dto.setMilesToGo("0公里");
        dto.setBodyState("未知");
        dto.setTirePressure("未知");
        dto.setBrakeState("未知");
        dto.setPowerState("未知");
    }
}