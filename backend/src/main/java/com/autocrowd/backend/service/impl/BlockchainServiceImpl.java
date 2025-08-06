package com.autocrowd.backend.service.impl;

import com.autocrowd.backend.config.BlockchainConfig;
import com.autocrowd.backend.entity.Order;
import com.autocrowd.backend.service.BlockchainService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;
import java.math.BigDecimal;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

import org.hyperledger.fabric.gateway.Contract;
import org.hyperledger.fabric.gateway.Gateway;
import org.hyperledger.fabric.gateway.Network;
import org.hyperledger.fabric.gateway.Wallet;
import org.hyperledger.fabric.gateway.Wallets;

import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class BlockchainServiceImpl implements BlockchainService {
    
    private static final Logger logger = LoggerFactory.getLogger(BlockchainServiceImpl.class);
    
    @Autowired
    private BlockchainConfig blockchainConfig;
    
    private Gateway gateway;
    private Network network;
    private Contract orderContract;
    private Contract financialContract;
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    // 区块链连接
    @PostConstruct
    public void init() {
        logger.info("[BlockchainService] 初始化区块链连接");
        logger.info("[BlockchainService] 区块链配置信息:");
        logger.info("  MSP ID: {}", blockchainConfig.getMspId());
        logger.info("  Channel Name: {}", blockchainConfig.getChannelName());
        logger.info("  Order Chaincode Name: {}", blockchainConfig.getOrderChaincodeName());
        logger.info("  Financial Chaincode Name: {}", blockchainConfig.getFinancialChaincodeName());
        logger.info("  Peer Endpoint: {}", blockchainConfig.getPeerEndpoint());
        logger.info("  Peer Host Alias: {}", blockchainConfig.getPeerHostAlias());
        
        try {
            // 创建钱包并加载身份
            Wallet wallet = Wallets.newFileSystemWallet(Paths.get("wallet"));
            
            // 创建gateway连接
            gateway = Gateway.createBuilder()
                    .identity(wallet, "user1")
                    .connect();
            
            // 获取网络和合约
            network = gateway.getNetwork(blockchainConfig.getChannelName());
            orderContract = network.getContract(blockchainConfig.getOrderChaincodeName());
            financialContract = network.getContract(blockchainConfig.getFinancialChaincodeName());
            
            logger.info("[BlockchainService] 区块链连接初始化成功");
        } catch (Exception e) {
            logger.error("[BlockchainService] 区块链连接初始化失败: {}", e.getMessage(), e);
        }
    }
    
    @PreDestroy
    public void destroy() {
        logger.info("[BlockchainService] 销毁区块链连接");
        if (gateway != null) {
            gateway.close();
        }
    }
    
    @Override
    public boolean createOrderOnBlockchain(Order order) {
        try {
            logger.info("[BlockchainService] 开始将订单信息上链: 订单ID={}", order.getOrderId());
            
            // 调用订单链码的CreateOrder方法
            String orderJson = objectMapper.writeValueAsString(order);
            orderContract.submitTransaction("CreateOrder", orderJson);
            
            logger.info("[BlockchainService] 订单信息上链成功: 订单ID={}", order.getOrderId());
            return true;
        } catch (Exception e) {
            logger.error("[BlockchainService] 订单上链失败: {}", e.getMessage(), e);
            return false;
        }
    }
    
    @Override
    public boolean createUserTransactionOnBlockchain(String financialId, Integer userId, BigDecimal amount, long timestamp) {
        try {
            logger.info("[BlockchainService] 开始将用户交易信息上链: 用户ID={}, 金额={}", userId, amount);
            
            // 调用金融链码的CreateAsset方法（用户交易）
            financialContract.submitTransaction("CreateAsset", financialId, "User" + userId, "Expenses", amount.toString(), String.valueOf(timestamp));
            
            logger.info("[BlockchainService] 用户交易信息上链成功: 用户ID={}", userId);
            return true;
        } catch (Exception e) {
            logger.error("[BlockchainService] 用户交易上链失败: {}", e.getMessage(), e);
            return false;
        }
    }
    
    @Override
    public boolean createDriverTransactionOnBlockchain(String financialId, Integer driverId, BigDecimal amount, long timestamp) {
        try {
            logger.info("[BlockchainService] 开始将车主交易信息上链: 车主ID={}, 金额={}", driverId, amount);
            
            // 调用金融链码的CreateAsset方法（车主交易）
            financialContract.submitTransaction("CreateAsset", financialId, "Driver" + driverId, "Earnings", amount.toString(), String.valueOf(timestamp));
            
            logger.info("[BlockchainService] 车主交易信息上链成功: 车主ID={}", driverId);
            return true;
        } catch (Exception e) {
            logger.error("[BlockchainService] 车主交易上链失败: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * 查询已完成的订单列表
     * @return 已完成的订单列表
     */
    @Override
    public List<Order> getCompletedOrdersFromBlockchain() {
        logger.info("[BlockchainService] 查询区块链上的已完成订单");
        try {
            // 调用订单链码的GetAllOrders方法
            byte[] result = orderContract.evaluateTransaction("GetAllOrders");
            String ordersJson = new String(result);
            // 这里需要根据实际返回的数据结构进行解析
            logger.info("[BlockchainService] 区块链已完成订单查询完成");
            return List.of(); // 实际应从区块链获取数据并解析
        } catch (Exception e) {
            logger.error("[BlockchainService] 查询已完成订单失败: {}", e.getMessage(), e);
            return List.of();
        }
    }

    /**
     * 获取总交易额
     * @return 总交易额
     */
    @Override
    public BigDecimal getTotalTransactionAmountFromBlockchain() {
        logger.info("[BlockchainService] 查询区块链上的总交易额");
        try {
            // 调用金融链码的GetTotalAmount方法（假设存在）
            byte[] result = financialContract.evaluateTransaction("GetTotalAmount");
            String amountStr = new String(result);
            BigDecimal amount = new BigDecimal(amountStr);
            logger.info("[BlockchainService] 区块链总交易额查询完成: {}", amount);
            return amount;
        } catch (Exception e) {
            logger.error("[BlockchainService] 查询总交易额失败: {}", e.getMessage(), e);
            return BigDecimal.ZERO;
        }
    }

    /**
     * 根据车主ID获取其总交易额
     * @param driverId 车主ID
     * @return 车主的总交易额
     */
    @Override
    public BigDecimal getTotalTransactionAmountByDriverFromBlockchain(Integer driverId) {
        logger.info("[BlockchainService] 查询车主在区块链上的总交易额: 车主ID={}", driverId);
        try {
            // 调用金融链码的GetTotalAmountByDriver方法（假设存在）
            byte[] result = financialContract.evaluateTransaction("GetTotalAmountByDriver", driverId.toString());
            String amountStr = new String(result);
            BigDecimal amount = new BigDecimal(amountStr);
            logger.info("[BlockchainService] 车主区块链总交易额查询完成: 车主ID={}, 金额={}", driverId, amount);
            return amount;
        } catch (Exception e) {
            logger.error("[BlockchainService] 查询车主总交易额失败: {}", e.getMessage(), e);
            return BigDecimal.ZERO;
        }
    }
}