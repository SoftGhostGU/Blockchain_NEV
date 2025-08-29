package com.autocrowd.backend.repository;

import com.autocrowd.backend.entity.Vehicle;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
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
     * 检查特定车牌号是否存在
     * @param licensePlate 车牌号
     * @return 如果车牌号存在则返回true，否则返回false
     */
    boolean existsByLicensePlate(String licensePlate);
    
    /**
     * 检查特定车辆是否属于特定司机
     * @param vehicleId 车辆ID
     * @param driverId 司机ID
     * @return 如果车辆属于该司机则返回true，否则返回false
     */
    boolean existsByVehicleIdAndDriverId(Integer vehicleId, Integer driverId);
    
    /**
     * 根据审核状态查询车辆
     * @param auditStatus 审核状态
     * @return 符合审核状态的车辆列表
     */
    @Query("SELECT v FROM Vehicle v WHERE v.auditStatus = ?1")
    List<Vehicle> findByAuditStatus(Byte auditStatus);
    
    /**
     * 根据车牌号模糊查询车辆（分页）
     * @param licensePlate 车牌号
     * @param pageable 分页信息
     * @return 匹配的车辆分页结果
     */
    Page<Vehicle> findByLicensePlateContaining(String licensePlate, Pageable pageable);
    
    /**
     * 根据审核状态查询车辆（分页）
     * @param auditStatus 审核状态
     * @param pageable 分页信息
     * @return 符合审核状态的车辆分页结果
     */
    Page<Vehicle> findByAuditStatus(Byte auditStatus, Pageable pageable);
}