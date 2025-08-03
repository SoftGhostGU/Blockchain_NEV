package com.autocrowd.backend.service;

import com.autocrowd.backend.entity.Order;
import java.math.BigDecimal;

public interface BlockchainService {
    /**
     * 将完成的订单信息上链
     * @param order 订单实体
     * @return 是否上链成功
     */
    boolean createOrderOnBlockchain(Order order);

    /**
     * 将用户交易信息上链
     * @param financialId 财务记录ID
     * @param userId 用户ID
     * @param amount 金额
     * @param timestamp 时间戳
     * @return 是否上链成功
     */
    boolean createUserTransactionOnBlockchain(String financialId, Integer userId, BigDecimal amount, long timestamp);

    /**
     * 将车主交易信息上链
     * @param financialId 财务记录ID
     * @param driverId 车主ID
     * @param amount 金额
     * @param timestamp 时间戳
     * @return 是否上链成功
     */
    boolean createDriverTransactionOnBlockchain(String financialId, Integer driverId, BigDecimal amount, long timestamp);
}