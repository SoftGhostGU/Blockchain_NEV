package com.autocrowd.backend.service.impl;

import com.autocrowd.backend.dto.VehicleCreateRequest;
import com.autocrowd.backend.dto.VehicleUpdateRequest;
import com.autocrowd.backend.dto.VehicleDTO;
import com.autocrowd.backend.entity.Vehicle;
import com.autocrowd.backend.exception.BusinessException;
import com.autocrowd.backend.exception.ExceptionCodeEnum;
import com.autocrowd.backend.repository.VehicleRepository;
import com.autocrowd.backend.service.VehicleService;
import lombok.AllArgsConstructor;
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
    private final VehicleRepository vehicleRepository;

    /**
     * 根据司机ID获取车辆信息
     * @param driverId 司机唯一标识ID
     * @return 车辆信息DTO对象
     * @throws BusinessException 如果司机ID为空或未找到车辆时抛出
     */
    @Override
    public List<VehicleDTO> getVehiclesByDriverId(Integer driverId) {
        System.out.println("[VehicleServiceImpl] 开始根据司机ID获取车辆信息: driverId = " + driverId);
        try {
            if (driverId == null) {
                System.out.println("[VehicleServiceImpl] 司机ID为空，抛出参数错误异常");
                throw new BusinessException(ExceptionCodeEnum.PARAM_NULL_ERROR);
            }
            List<Vehicle> vehicles = vehicleRepository.findByDriverId(driverId);
            System.out.println("[VehicleServiceImpl] 从数据库查询到车辆列表: 数量 = " + vehicles.size());
            if (vehicles.isEmpty()) {
                System.out.println("[VehicleServiceImpl] 未找到司机的车辆信息: driverId = " + driverId);
                throw new BusinessException(ExceptionCodeEnum.VEHICLE_NOT_FOUND);
            }
            List<VehicleDTO> result = vehicles.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
            System.out.println("[VehicleServiceImpl] 转换车辆列表为DTO完成，数量: " + result.size());
            return result;
        } catch (Exception e) {
            System.out.println("[VehicleServiceImpl] 获取车辆信息时发生异常: " + e.getMessage());
            throw new BusinessException(ExceptionCodeEnum.VEHICLE_QUERY_ERROR, "获取车辆信息失败: " + e.getMessage());
        }
    }

    /**
     * 创建车辆业务逻辑实现
     * @param driverId 司机ID
     * @param request 车辆创建请求DTO
     * @return 创建的车辆DTO
     * @throws BusinessException 当参数无效或创建失败时抛出
     */
    @Override
    public VehicleDTO createVehicle(Integer driverId, VehicleCreateRequest request) {
        System.out.println("[VehicleServiceImpl] 开始创建车辆: driverId=" + driverId + ", request=" + request);
        try {
            // 参数校验
            if (driverId == null) {
                System.out.println("[VehicleServiceImpl] 司机ID为空");
                throw new BusinessException(ExceptionCodeEnum.PARAM_NULL_ERROR);
            }
            if (request == null) {
                System.out.println("[VehicleServiceImpl] 请求参数为空");
                throw new BusinessException(ExceptionCodeEnum.PARAM_NULL_ERROR);
            }
            if (request.getLicensePlate() == null || request.getLicensePlate().trim().isEmpty()) {
                System.out.println("[VehicleServiceImpl] 车牌号为空");
                throw new BusinessException(ExceptionCodeEnum.PARAM_ERROR, "车牌号不能为空");
            }

            // 检查车牌号是否已存在
            if (vehicleRepository.existsByLicensePlate(request.getLicensePlate())) {
                System.out.println("[VehicleServiceImpl] 车牌号已存在: " + request.getLicensePlate());
                throw new BusinessException(ExceptionCodeEnum.VEHICLE_LICENSE_PLATE_EXISTS, "车牌号已存在");
            }

            // 创建车辆实体
            Vehicle vehicle = new Vehicle();
            vehicle.setLicensePlate(request.getLicensePlate().trim());
            vehicle.setDriverId(driverId);
            vehicle.setFuelLevel(request.getFuelLevel() != null ? request.getFuelLevel() : BigDecimal.valueOf(100.00));
            vehicle.setConditionId(request.getConditionId());
            vehicle.setCreatedAt(LocalDateTime.now());
            vehicle.setUpdatedAt(LocalDateTime.now());

            // 保存到数据库
            Vehicle savedVehicle = vehicleRepository.save(vehicle);
            System.out.println("[VehicleServiceImpl] 车辆创建成功: vehicleId=" + savedVehicle.getVehicleId());

            // 转换为DTO并返回
            return convertToDTO(savedVehicle);
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            System.out.println("[VehicleServiceImpl] 创建车辆时发生异常: " + e.getMessage());
            throw new BusinessException(ExceptionCodeEnum.VEHICLE_CREATE_ERROR, "创建车辆失败: " + e.getMessage());
        }
    }

    /**
     * 更新车辆信息业务逻辑实现
     * @param driverId 司机ID
     * @param request 车辆更新请求DTO
     * @return 更新后的车辆DTO
     * @throws BusinessException 当参数无效或更新失败时抛出
     */
    @Override
    public VehicleDTO updateVehicle(Integer driverId, VehicleUpdateRequest request) {
        System.out.println("[VehicleServiceImpl] 开始更新车辆: driverId=" + driverId + ", request=" + request);
        try {
            // 参数校验
            if (driverId == null) {
                System.out.println("[VehicleServiceImpl] 司机ID为空");
                throw new BusinessException(ExceptionCodeEnum.PARAM_NULL_ERROR);
            }
            if (request == null || request.getVehicleId() == null) {
                System.out.println("[VehicleServiceImpl] 请求参数或车辆ID为空");
                throw new BusinessException(ExceptionCodeEnum.PARAM_NULL_ERROR);
            }

            // 验证车辆是否存在且属于该司机
            if (!vehicleRepository.existsByVehicleIdAndDriverId(request.getVehicleId(), driverId)) {
                System.out.println("[VehicleServiceImpl] 车辆不存在或不属于该司机: vehicleId=" + request.getVehicleId() + ", driverId=" + driverId);
                throw new BusinessException(ExceptionCodeEnum.VEHICLE_NOT_FOUND, "车辆不存在或无权限操作");
            }

            // 获取车辆实体
            Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                    .orElseThrow(() -> {
                        System.out.println("[VehicleServiceImpl] 车辆不存在: vehicleId=" + request.getVehicleId());
                        return new BusinessException(ExceptionCodeEnum.VEHICLE_NOT_FOUND, "车辆不存在");
                    });

            // 更新车辆信息
            if (request.getLicensePlate() != null && !request.getLicensePlate().trim().isEmpty()) {
                // 检查新车牌号是否与其他车辆重复
                if (!request.getLicensePlate().trim().equals(vehicle.getLicensePlate()) &&
                    vehicleRepository.existsByLicensePlate(request.getLicensePlate().trim())) {
                    System.out.println("[VehicleServiceImpl] 车牌号已存在: " + request.getLicensePlate());
                    throw new BusinessException(ExceptionCodeEnum.VEHICLE_LICENSE_PLATE_EXISTS, "车牌号已存在");
                }
                vehicle.setLicensePlate(request.getLicensePlate().trim());
            }
            if (request.getFuelLevel() != null) {
                vehicle.setFuelLevel(BigDecimal.valueOf(request.getFuelLevel()));
            }
            if (request.getConditionId() != null) {
                vehicle.setConditionId(request.getConditionId());
            }
            vehicle.setUpdatedAt(LocalDateTime.now());

            // 保存到数据库
            Vehicle updatedVehicle = vehicleRepository.save(vehicle);
            System.out.println("[VehicleServiceImpl] 车辆更新成功: vehicleId=" + updatedVehicle.getVehicleId());

            // 转换为DTO并返回
            return convertToDTO(updatedVehicle);
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            System.out.println("[VehicleServiceImpl] 更新车辆时发生异常: " + e.getMessage());
            throw new BusinessException(ExceptionCodeEnum.VEHICLE_UPDATE_ERROR, "更新车辆失败: " + e.getMessage());
        }
    }

    /**
     * 删除车辆业务逻辑实现
     * @param driverId 司机ID
     * @param vehicleId 车辆ID
     * @return 删除结果
     * @throws BusinessException 当参数无效或删除失败时抛出
     */
    @Override
    public boolean deleteVehicle(Integer driverId, Integer vehicleId) {
        System.out.println("[VehicleServiceImpl] 开始删除车辆: driverId=" + driverId + ", vehicleId=" + vehicleId);
        try {
            // 参数校验
            if (driverId == null || vehicleId == null) {
                System.out.println("[VehicleServiceImpl] 司机ID或车辆ID为空");
                throw new BusinessException(ExceptionCodeEnum.PARAM_NULL_ERROR);
            }

            // 验证车辆是否存在且属于该司机
            if (!vehicleRepository.existsByVehicleIdAndDriverId(vehicleId, driverId)) {
                System.out.println("[VehicleServiceImpl] 车辆不存在或不属于该司机: vehicleId=" + vehicleId + ", driverId=" + driverId);
                throw new BusinessException(ExceptionCodeEnum.VEHICLE_NOT_FOUND, "车辆不存在或无权限操作");
            }

            // 删除车辆
            vehicleRepository.deleteById(vehicleId);
            System.out.println("[VehicleServiceImpl] 车辆删除成功: vehicleId=" + vehicleId);
            return true;
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            System.out.println("[VehicleServiceImpl] 删除车辆时发生异常: " + e.getMessage());
            throw new BusinessException(ExceptionCodeEnum.VEHICLE_DELETE_ERROR, "删除车辆失败: " + e.getMessage());
        }
    }

    /**
     * 将Vehicle实体转换为VehicleDTO
     * @param vehicle 车辆实体
     * @return 车辆DTO
     */
    private VehicleDTO convertToDTO(Vehicle vehicle) {
        VehicleDTO dto = new VehicleDTO();
        dto.setVehicleId(vehicle.getVehicleId());
        dto.setLicensePlate(vehicle.getLicensePlate());
        dto.setDriverId(vehicle.getDriverId());
        dto.setFuelLevel(vehicle.getFuelLevel());
        dto.setConditionId(vehicle.getConditionId());
        dto.setCreatedAt(vehicle.getCreatedAt());
        dto.setUpdatedAt(vehicle.getUpdatedAt());
        // condition信息使用占位符
        return dto;
    }
}