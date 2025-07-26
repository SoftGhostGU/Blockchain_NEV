package com.autocrowd.backend.service.impl;

import com.autocrowd.backend.dto.VehicleCreateRequest;
import com.autocrowd.backend.dto.VehicleUpdateRequest;
import com.autocrowd.backend.dto.VehicleDTO;
import com.autocrowd.backend.service.VehicleService;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import com.autocrowd.backend.entity.Vehicle;
import com.autocrowd.backend.repository.VehicleRepository;
import com.autocrowd.backend.exception.BusinessException;
import com.autocrowd.backend.exception.ExceptionCodeEnum;
import org.springframework.beans.BeanUtils;
import java.util.List;
import java.util.stream.Collectors;
import java.time.LocalDateTime;

/**
 * 车辆服务实现类
 * 处理车辆相关业务逻辑，实现VehicleService接口定义的所有方法
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
            System.out.println("[VehicleServiceImpl] 成功获取车辆信息: vehicleId = " + result.get(0).getVehicleId() + ", 数量 = " + result.size());
            return result;
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            System.err.println("[VehicleServiceImpl] 获取车辆信息异常: " + e.getMessage());
            throw new BusinessException(ExceptionCodeEnum.SYSTEM_ERROR, "获取车辆信息失败: " + e.getMessage());
        }
    }

    /**
     * 创建新车辆
     * @param driverId 司机唯一标识ID
     * @param request 车辆创建请求对象
     * @return 创建成功的车辆DTO对象
     * @throws BusinessException 如果参数无效或创建失败时抛出
     */
    @Override
    public VehicleDTO createVehicle(Integer driverId, VehicleCreateRequest request) {
        System.out.println("[VehicleServiceImpl] 开始创建车辆: driverId = " + driverId + ", 请求参数: " + request);
        try {
            if (driverId == null || request == null) {
                throw new BusinessException(ExceptionCodeEnum.PARAM_NULL_ERROR);
            }
            
            Vehicle vehicle = new Vehicle();
            BeanUtils.copyProperties(request, vehicle);
            vehicle.setDriverId(driverId);
            vehicle.setCreatedAt(LocalDateTime.now());
            vehicle.setUpdatedAt(LocalDateTime.now());
            
            Vehicle savedVehicle = vehicleRepository.save(vehicle);
            System.out.println("[VehicleServiceImpl] 车辆保存成功: vehicleId = " + savedVehicle.getVehicleId());
            return convertToDTO(savedVehicle);
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            System.err.println("[VehicleServiceImpl] 创建车辆异常: " + e.getMessage());
            throw new BusinessException(ExceptionCodeEnum.SYSTEM_ERROR, "创建车辆失败: " + e.getMessage());
        }
    }

    /**
     * 更新车辆信息
     * @param driverId 司机唯一标识ID
     * @param request 车辆更新请求对象
     * @return 更新后的车辆DTO对象
     * @throws BusinessException 如果参数无效、未找到车辆或无权限时抛出
     */
    @Override
    public VehicleDTO updateVehicle(Integer driverId, VehicleUpdateRequest request) {
        System.out.println("[VehicleServiceImpl] 开始更新车辆: driverId = " + driverId + ", 请求参数: " + request);
        try {
            if (driverId == null || request == null || request.getVehicleId() == null) {
                throw new BusinessException(ExceptionCodeEnum.PARAM_NULL_ERROR);
            }
            
            Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new BusinessException(ExceptionCodeEnum.VEHICLE_NOT_FOUND));
            
            // Verify that the vehicle belongs to the driver
            if (!vehicle.getDriverId().equals(driverId)) {
                throw new BusinessException(ExceptionCodeEnum.PERMISSION_DENIED);
            }
            
            BeanUtils.copyProperties(request, vehicle);
            vehicle.setUpdatedAt(LocalDateTime.now());
            
            Vehicle updatedVehicle = vehicleRepository.save(vehicle);
            System.out.println("[VehicleServiceImpl] 车辆更新成功: vehicleId = " + updatedVehicle.getVehicleId());
            return convertToDTO(updatedVehicle);
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            System.err.println("[VehicleServiceImpl] 更新车辆异常: " + e.getMessage());
            throw new BusinessException(ExceptionCodeEnum.SYSTEM_ERROR, "更新车辆失败: " + e.getMessage());
        }
    }

    private VehicleDTO convertToDTO(Vehicle vehicle) {
        VehicleDTO dto = new VehicleDTO();
        BeanUtils.copyProperties(vehicle, dto);
        return dto;
    }
}