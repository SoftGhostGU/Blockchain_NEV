package com.autocrowd.backend.enums;

/**
 * 车辆状态枚举
 * 用于表示车辆各种状态的统一枚举
 */
public enum VehicleStatusEnum {
    NORMAL(1, "正常"),
    ATTENTION(2, "注意"), 
    DANGER(3, "危险");
    
    private final Integer code;
    private final String description;
    
    VehicleStatusEnum(Integer code, String description) {
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
     * 根据描述获取枚举
     * @param description 描述
     * @return 对应的枚举值
     */
    public static VehicleStatusEnum fromDescription(String description) {
        for (VehicleStatusEnum status : VehicleStatusEnum.values()) {
            if (status.getDescription().equals(description)) {
                return status;
            }
        }
        return NORMAL; // 默认返回正常
    }
    
    /**
     * 根据代码获取枚举
     * @param code 代码
     * @return 对应的枚举值
     */
    public static VehicleStatusEnum fromCode(Integer code) {
        for (VehicleStatusEnum status : VehicleStatusEnum.values()) {
            if (status.getCode().equals(code)) {
                return status;
            }
        }
        return NORMAL; // 默认返回正常
    }
}