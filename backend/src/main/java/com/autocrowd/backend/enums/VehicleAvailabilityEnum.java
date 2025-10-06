package com.autocrowd.backend.enums;

/**
 * 车辆可用性状态枚举
 * 用于表示车辆是否可以接单的状态
 */
public enum VehicleAvailabilityEnum {
    AVAILABLE(1, "可接单"),
    UNAVAILABLE(2, "不可接单");
    
    private final Integer code;
    private final String description;
    
    VehicleAvailabilityEnum(Integer code, String description) {
        this.code = code;
        this.description = description;
    }
    
    public Integer getCode() {
        return code;
    }
    
    public String getDescription() {
        return description;
    }
    
    /**
     * 根据代码获取枚举
     * @param code 代码
     * @return 对应的枚举值
     */
    public static VehicleAvailabilityEnum fromCode(Integer code) {
        for (VehicleAvailabilityEnum status : VehicleAvailabilityEnum.values()) {
            if (status.getCode().equals(code)) {
                return status;
            }
        }
        return UNAVAILABLE; // 默认返回不可接单
    }
}