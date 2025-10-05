package com.autocrowd.backend.enums;

/**
 * 订单类型枚举
 * 包含六种类型：网约车、紧急医疗、路况监控、移动零售、能源交易、同城配送
 */
public enum OrderTypeEnum {
    ONLINE_CAR("网约车"),
    EMERGENCY_MEDICAL("紧急医疗"), 
    TRAFFIC_MONITORING("路况监控"),
    MOBILE_RETAIL("移动零售"),
    ENERGY_TRADING("能源交易"),
    CITY_DELIVERY("同城配送");
    
    private final String description;
    
    OrderTypeEnum(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
    
    /**
     * 根据描述获取枚举
     * @param description 描述
     * @return 对应的枚举值
     */
    public static OrderTypeEnum fromDescription(String description) {
        for (OrderTypeEnum type : OrderTypeEnum.values()) {
            if (type.getDescription().equals(description)) {
                return type;
            }
        }
        return ONLINE_CAR; // 默认返回网约车
    }
}