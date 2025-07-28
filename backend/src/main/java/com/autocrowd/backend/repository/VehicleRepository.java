package com.autocrowd.backend.repository;

import com.autocrowd.backend.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 车辆数据访问接口
 * 提供车辆实体的数据库操作方法，作为三层架构中的数据访问层
 */
@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Integer> {
    List<Vehicle> findByDriverId(Integer driverId);
    /**
     * 检查特定车辆是否属于特定司机
     * @param vehicleId 车辆ID
     * @param driverId 司机ID
     * @return 如果车辆属于该司机则返回true，否则返回false
     */
    boolean existsByVehicleIdAndDriverId(Integer vehicleId, Integer driverId);
}