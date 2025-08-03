package com.autocrowd.backend.service.impl;

import com.autocrowd.backend.dto.vehicle.VehicleCreateRequest;
import com.autocrowd.backend.dto.vehicle.VehicleDTO;
import com.autocrowd.backend.dto.vehicle.VehicleUpdateRequest;
import com.autocrowd.backend.entity.Vehicle;
import com.autocrowd.backend.exception.BusinessException;
import com.autocrowd.backend.exception.ExceptionCodeEnum;
import com.autocrowd.backend.repository.VehicleRepository;
import com.autocrowd.backend.service.VehicleService;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 车辆服务实现类
 * 实现VehicleService接口定义的业务逻辑，作为服务层的具体实现
 */
@Service
@AllArgsConstructor
public class VehicleServiceImpl implements VehicleService {
    private static final Logger logger = LoggerFactory.getLogger(VehicleServiceImpl.class);
    
    private final VehicleRepository vehicleRepository;

    /**
     * 根据司机ID获取车辆信息
     * @param driverId 司机唯一标识ID
     * @return 车辆信息DTO对象
     * @throws BusinessException 如果司机ID为空或未找到车辆时抛出
     */
    @Override
    public List<VehicleDTO> getVehiclesByDriverId(Integer driverId) {
        try {
            if (driverId == null) {
                throw new BusinessException(ExceptionCodeEnum.PARAM_NULL_ERROR);
            }
            List<Vehicle> vehicles = vehicleRepository.findByDriverId(driverId);
            if (vehicles.isEmpty()) {
                throw new BusinessException(ExceptionCodeEnum.VEHICLE_NOT_FOUND);
            }
            List<VehicleDTO> result = vehicles.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
            return result;
        } catch (Exception e) {
            logger.error("[VehicleServiceImpl] 获取车辆信息时发生异常: {}", e.getMessage(), e);
            throw new BusinessException(ExceptionCodeEnum.VEHICLE_QUERY_ERROR, "获取车辆信息失败: " + e.getMessage());
        }
    }

    /**
     * 创建新车辆
     * @param driverId 司机ID
     * @param request 车辆创建请求DTO
     * @return 创建的车辆DTO对象
     * @throws BusinessException 参数验证失败或创建失败时抛出
     */
    @Override
    public VehicleDTO createVehicle(Integer driverId, VehicleCreateRequest request) {
        try {
            // 参数验证
            if (driverId == null) {
                throw new BusinessException(ExceptionCodeEnum.PARAM_NULL_ERROR, "司机ID不能为空");
            }
            if (request == null) {
                throw new BusinessException(ExceptionCodeEnum.PARAM_NULL_ERROR, "请求参数不能为空");
            }
            if (request.getLicensePlate() == null || request.getLicensePlate().trim().isEmpty()) {
                throw new BusinessException(ExceptionCodeEnum.PARAM_ERROR, "车牌号不能为空");
            }

            // 检查车牌号是否已存在
            if (vehicleRepository.existsByLicensePlate(request.getLicensePlate())) {
                throw new BusinessException(ExceptionCodeEnum.VEHICLE_LICENSE_PLATE_EXISTS, "车牌号已存在");
            }

            // 创建车辆实体
            Vehicle vehicle = new Vehicle();
            vehicle.setDriverId(driverId);
            vehicle.setLicensePlate(request.getLicensePlate().toUpperCase());
            vehicle.setFuelLevel(request.getFuelLevel() != null ? request.getFuelLevel() : BigDecimal.valueOf(100));
            vehicle.setCreatedAt(LocalDateTime.now());
            vehicle.setUpdatedAt(LocalDateTime.now());

            // 保存车辆
            Vehicle savedVehicle = vehicleRepository.save(vehicle);

            // 转换为DTO并返回
            return convertToDTO(savedVehicle);
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            logger.error("[VehicleServiceImpl] 创建车辆时发生异常: {}", e.getMessage(), e);
            throw new BusinessException(ExceptionCodeEnum.VEHICLE_CREATE_ERROR, "创建车辆失败: " + e.getMessage());
        }
    }

    /**
     * 更新车辆信息
     * @param driverId 司机ID
     * @param request 车辆更新请求DTO
     * @return 更新后的车辆DTO对象
     * @throws BusinessException 参数验证失败或更新失败时抛出
     */
    @Override
    public VehicleDTO updateVehicle(Integer driverId, VehicleUpdateRequest request) {
        try {
            // 参数验证
            if (driverId == null) {
                throw new BusinessException(ExceptionCodeEnum.PARAM_NULL_ERROR, "司机ID不能为空");
            }
            if (request == null || request.getVehicleId() == null) {
                throw new BusinessException(ExceptionCodeEnum.PARAM_NULL_ERROR, "请求参数和车辆ID不能为空");
            }

            // 检查车辆是否存在且属于该司机
            Vehicle existingVehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new BusinessException(ExceptionCodeEnum.VEHICLE_NOT_FOUND, "车辆不存在"));
                
            if (!existingVehicle.getDriverId().equals(driverId)) {
                throw new BusinessException(ExceptionCodeEnum.VEHICLE_NOT_FOUND, "车辆不存在或不属于该司机");
            }

            // 检查车牌号是否已存在（排除自己）
            if (request.getLicensePlate() != null && !request.getLicensePlate().trim().isEmpty()) {
                if (!request.getLicensePlate().equalsIgnoreCase(existingVehicle.getLicensePlate())) {
                    if (vehicleRepository.existsByLicensePlate(request.getLicensePlate())) {
                        throw new BusinessException(ExceptionCodeEnum.VEHICLE_LICENSE_PLATE_EXISTS, "车牌号已存在");
                    }
                    existingVehicle.setLicensePlate(request.getLicensePlate().toUpperCase());
                }
            }

            // 更新车辆信息
            if (request.getFuelLevel() != null) {
                existingVehicle.setFuelLevel(BigDecimal.valueOf(request.getFuelLevel()));
            }
            existingVehicle.setUpdatedAt(LocalDateTime.now());

            // 保存更新
            Vehicle updatedVehicle = vehicleRepository.save(existingVehicle);

            // 转换为DTO并返回
            return convertToDTO(updatedVehicle);
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            logger.error("[VehicleServiceImpl] 更新车辆时发生异常: {}", e.getMessage(), e);
            throw new BusinessException(ExceptionCodeEnum.VEHICLE_UPDATE_ERROR, "更新车辆失败: " + e.getMessage());
        }
    }

    /**
     * 删除车辆
     * @param driverId 司机ID
     * @param vehicleId 车辆ID
     * @return 删除结果
     * @throws BusinessException 参数验证失败或删除失败时抛出
     */
    @Override
    public boolean deleteVehicle(Integer driverId, Integer vehicleId) {
        try {
            // 参数验证
            if (driverId == null || vehicleId == null) {
                throw new BusinessException(ExceptionCodeEnum.PARAM_NULL_ERROR, "司机ID和车辆ID不能为空");
            }

            // 检查车辆是否存在且属于该司机
            Vehicle existingVehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new BusinessException(ExceptionCodeEnum.VEHICLE_NOT_FOUND, "车辆不存在"));
                
            if (!existingVehicle.getDriverId().equals(driverId)) {
                throw new BusinessException(ExceptionCodeEnum.VEHICLE_NOT_FOUND, "车辆不存在或不属于该司机");
            }

            // 删除车辆
            vehicleRepository.deleteById(vehicleId);
            return true;
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            logger.error("[VehicleServiceImpl] 删除车辆时发生异常: {}", e.getMessage(), e);
            throw new BusinessException(ExceptionCodeEnum.VEHICLE_DELETE_ERROR, "删除车辆失败: " + e.getMessage());
        }
    }

    /**
     * 将车辆实体转换为DTO
     * @param vehicle 车辆实体
     * @return 车辆DTO
     */
    private VehicleDTO convertToDTO(Vehicle vehicle) {
        VehicleDTO dto = new VehicleDTO();
        BeanUtils.copyProperties(vehicle, dto);
        return dto;
    }
}