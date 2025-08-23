package com.autocrowd.backend.dto.order;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 价格预估请求DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EstimatePriceRequest {
    /**
     * 起始位置
     */
    @NotBlank(message = "起始位置不能为空")
    private String startLocation;

    /**
     * 目的地
     */
    @NotBlank(message = "目的地不能为空")
    private String destination;

    /**
     * 车辆类型
     */
    private String vehicle_type;
}