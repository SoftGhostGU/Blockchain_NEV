package com.autocrowd.backend.service;

import com.autocrowd.backend.entity.Financial;
import com.autocrowd.backend.entity.Order;
import java.math.BigDecimal;
import java.util.List;

public interface BlockchainService {
    /**
     * 将完成的订单信息上链
     * @param order 订单实体
     * @return 是否上链成功
     */
    boolean createOrderOnBlockchain(Order order);

    /**
     * 保存对订单信息的修改
     * @param order 订单实体
     * @return 是否保存成功
     */
    boolean saveOrderOnBlockchain(Order order);
    /**
     * 将用户交易信息上链
     * @param userFinancial 用户财务记录
     * @return 是否上链成功
     */
    boolean createUserTransactionOnBlockchain(Financial userFinancial);

    /**
     * 将车主交易信息上链
     * @param driverFinancial 车主财务记录
     * @return 是否上链成功
     */
    boolean createDriverTransactionOnBlockchain(Financial driverFinancial);

    /**
     * 查询已完成的订单列表
     * @return 已完成的订单列表
     */
    List<Order> getCompletedOrdersFromBlockchain();

    /**
     * 获取总交易额
     * @return 总交易额
     */
    BigDecimal getTotalTransactionAmountFromBlockchain();

    /**
     * 根据车主ID获取其总交易额
     * @param driverId 车主ID
     * @return 车主的总交易额
     */
    BigDecimal getTotalTransactionAmountByDriverFromBlockchain(Integer driverId);
}