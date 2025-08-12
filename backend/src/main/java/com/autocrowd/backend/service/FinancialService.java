package com.autocrowd.backend.service;

import com.autocrowd.backend.dto.financial.FinancialRecordDTO;
import com.autocrowd.backend.entity.Financial;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface FinancialService {
    /**
     * 用户充值
     * @param userId 用户ID
     * @param role 角色(User/Driver)
     * @param amount 充值金额
     */
    void recharge(Integer userId, String role, BigDecimal amount);
    
    /**
     * 用户提现
     * @param userId 用户ID
     * @param role 角色(User/Driver)
     * @param amount 提现金额
     */
    void withdraw(Integer userId, String role, BigDecimal amount);
    
    /**
     * 查询用户财务记录
     * @param userId 用户ID
     * @param role 角色
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @return 财务记录列表
     */
    List<FinancialRecordDTO> getUserFinancialRecords(Integer userId, String role, LocalDateTime startTime, LocalDateTime endTime);
    
    /**
     * 更新用户余额并同步到区块链
     * @param userId 用户ID
     * @param role 角色
     * @param newBalance 新余额
     */
    void updateUserBalanceOnBlockchain(Integer userId, String role, BigDecimal newBalance);
}