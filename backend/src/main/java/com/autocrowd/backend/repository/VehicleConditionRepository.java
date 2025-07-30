package com.autocrowd.backend.repository;

import com.autocrowd.backend.entity.VehicleCondition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VehicleConditionRepository extends JpaRepository<VehicleCondition, Integer> {
}