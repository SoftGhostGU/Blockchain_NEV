package com.autocrowd.backend.service.impl;

import com.autocrowd.backend.dto.financial.FinancialRecordDTO;
import com.autocrowd.backend.entity.Driver;
import com.autocrowd.backend.entity.Financial;
import com.autocrowd.backend.entity.User;
import com.autocrowd.backend.exception.ExceptionCodeEnum;
import com.autocrowd.backend.exception.BusinessException;
import com.autocrowd.backend.repository.DriverRepository;
import com.autocrowd.backend.repository.FinancialRepository;
import com.autocrowd.backend.repository.UserRepository;
import com.autocrowd.backend.service.BlockchainService;
import com.autocrowd.backend.service.FinancialService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FinancialServiceImpl implements FinancialService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private DriverRepository driverRepository;
    
    @Autowired
    private FinancialRepository financialRepository;
    
    @Autowired
    private BlockchainService blockchainService;
    
    @Override
    @Transactional
    public void recharge(Integer userId, String role, BigDecimal amount) {
        // 验证金额
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException(ExceptionCodeEnum.INVALID_TRANSACTION_AMOUNT, "充值金额必须大于0");
        }
        
        // 更新用户余额
        if ("User".equals(role)) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new BusinessException(ExceptionCodeEnum.USER_NOT_FOUND, "用户不存在"));
            
            if (user.getBalance() == null) {
                user.setBalance(BigDecimal.ZERO);
            }
            user.setBalance(user.getBalance().add(amount));
            user.setUpdatedAt(LocalDateTime.now());
            userRepository.save(user);
        } else if ("Driver".equals(role)) {
            Driver driver = driverRepository.findById(userId)
                    .orElseThrow(() -> new BusinessException(ExceptionCodeEnum.DRIVER_NOT_FOUND, "车主不存在"));
            
            if (driver.getWalletBalance() == null) {
                driver.setWalletBalance(BigDecimal.ZERO);
            }
            driver.setWalletBalance(driver.getWalletBalance().add(amount));
            driver.setUpdatedAt(LocalDateTime.now());
            driverRepository.save(driver);
        }
        
        // 创建充值记录
        Financial financial = new Financial();
        financial.setUserId(userId);
        financial.setRole(role);
        financial.setTransactionType(Financial.TransactionType.Recharge);
        financial.setAmount(amount);
        financial.setTransactionTime(LocalDateTime.now());
        financialRepository.save(financial);
        
        // 上链操作
        String financialId = "FIN_RECHARGE_" + userId + "_" + System.currentTimeMillis();
        long timestamp = System.currentTimeMillis();
        
        if ("User".equals(role)) {
            blockchainService.createUserTransactionOnBlockchain(financialId, userId, amount, timestamp);
        } else {
            blockchainService.createDriverTransactionOnBlockchain(financialId, userId, amount, timestamp);
        }
    }
    
    @Override
    @Transactional
    public void withdraw(Integer userId, String role, BigDecimal amount) {
        // 验证金额
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException(ExceptionCodeEnum.INVALID_TRANSACTION_AMOUNT, "提现金额必须大于0");
        }
        
        // 检查余额是否充足
        if ("User".equals(role)) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new BusinessException(ExceptionCodeEnum.USER_NOT_FOUND, "用户不存在"));
            
            if (user.getBalance() == null || user.getBalance().compareTo(amount) < 0) {
                throw new BusinessException(ExceptionCodeEnum.INSUFFICIENT_BALANCE, "余额不足");
            }
            
            user.setBalance(user.getBalance().subtract(amount));
            user.setUpdatedAt(LocalDateTime.now());
            userRepository.save(user);
        } else if ("Driver".equals(role)) {
            Driver driver = driverRepository.findById(userId)
                    .orElseThrow(() -> new BusinessException(ExceptionCodeEnum.DRIVER_NOT_FOUND, "车主不存在"));
            
            if (driver.getWalletBalance() == null || driver.getWalletBalance().compareTo(amount) < 0) {
                throw new BusinessException(ExceptionCodeEnum.INSUFFICIENT_BALANCE, "余额不足");
            }
            
            driver.setWalletBalance(driver.getWalletBalance().subtract(amount));
            driver.setUpdatedAt(LocalDateTime.now());
            driverRepository.save(driver);
        }
        
        // 创建提现记录
        Financial financial = new Financial();
        financial.setUserId(userId);
        financial.setRole(role);
        financial.setTransactionType(Financial.TransactionType.Withdrawal);
        financial.setAmount(amount);
        financial.setTransactionTime(LocalDateTime.now());
        financialRepository.save(financial);
        
        // 上链操作
        String financialId = "FIN_WITHDRAW_" + userId + "_" + System.currentTimeMillis();
        long timestamp = System.currentTimeMillis();
        
        if ("User".equals(role)) {
            blockchainService.createUserTransactionOnBlockchain(financialId, userId, amount, timestamp);
        } else {
            blockchainService.createDriverTransactionOnBlockchain(financialId, userId, amount, timestamp);
        }
    }
    
    @Override
    public List<FinancialRecordDTO> getUserFinancialRecords(Integer userId, String role, LocalDateTime startTime, LocalDateTime endTime) {
        List<Financial> financialList = financialRepository.findByRoleAndUserIdAndTransactionTimeBetween(
                role, userId, startTime, endTime);
        
        return financialList.stream().map(financial -> {
            FinancialRecordDTO dto = new FinancialRecordDTO();
            dto.setFinancialId(financial.getFinancialId());
            dto.setUserId(financial.getUserId());
            dto.setRole(financial.getRole());
            dto.setTransactionType(financial.getTransactionType().name());
            dto.setAmount(financial.getAmount());
            dto.setTransactionTime(financial.getTransactionTime());
            return dto;
        }).collect(Collectors.toList());
    }
    
    @Override
    public void updateUserBalanceOnBlockchain(Integer userId, String role, BigDecimal newBalance) {
        // 这里可以实现将用户余额更新同步到区块链的逻辑
        // 由于是占位功能，我们只记录日志
        System.out.println("更新用户余额到区块链: userId=" + userId + ", role=" + role + ", newBalance=" + newBalance);
    }
}