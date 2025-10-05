package com.autocrowd.backend.dto.order;

import lombok.Data;

/**
 * 评价分布DTO
 */
@Data
public class StarDistributionDTO {
    private Integer star;   // 星级 (1-5)
    private Long count;     // 该星级的数量
    
    public StarDistributionDTO(Integer star, Long count) {
        this.star = star;
        this.count = count;
    }
}