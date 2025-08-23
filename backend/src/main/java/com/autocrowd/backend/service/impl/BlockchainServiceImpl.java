package com.autocrowd.backend.service.impl;

import com.autocrowd.backend.config.BlockchainConfig;
import com.autocrowd.backend.entity.Financial;
import com.autocrowd.backend.entity.Order;
import com.autocrowd.backend.service.BlockchainService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateSerializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalTimeSerializer;
import io.grpc.Channel;
import org.hyperledger.fabric.client.Contract;
import org.hyperledger.fabric.client.Gateway;
import org.hyperledger.fabric.client.Hash;
import org.hyperledger.fabric.client.Network;
import org.hyperledger.fabric.client.identity.Identity;
import org.hyperledger.fabric.client.identity.Identities;
import org.hyperledger.fabric.client.identity.Signer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;
import java.io.IOException;
import java.io.Reader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.InvalidKeyException;
import java.security.PrivateKey;
import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.TimeUnit;

import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class BlockchainServiceImpl implements BlockchainService {
    
    private static final Logger logger = LoggerFactory.getLogger(BlockchainServiceImpl.class);
    
    @Autowired
    private BlockchainConfig blockchainConfig;
    
    private Gateway gateway;
    private Network network;

//    @Resource
    private Contract orderContract;
    private Contract financialContract;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // 区块链连接
    @PostConstruct
    public void init() {
        JavaTimeModule javaTimeModule = new JavaTimeModule();
        javaTimeModule.addSerializer(LocalDate.class, new LocalDateSerializer(DateTimeFormatter.ofPattern("yyyy-MM-dd")));
        javaTimeModule.addSerializer(LocalDateTime.class, new LocalDateTimeSerializer(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        javaTimeModule.addSerializer(LocalTime.class, new LocalTimeSerializer(DateTimeFormatter.ofPattern("HH:mm:ss")));
        objectMapper.registerModule(javaTimeModule);

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
            Identity identity = BlockchainConfig.newIdentity(Paths.get(blockchainConfig.getCertDirPath()), blockchainConfig.getMspId());
            Signer signer = BlockchainConfig.newSigner(Paths.get(blockchainConfig.getKeyDirPath()));
            Channel channel = BlockchainConfig.newGrpcConnection(Paths.get(blockchainConfig.getTlsCertPath()), blockchainConfig.getPeerEndpoint(), blockchainConfig.getPeerHostAlias());

            // 创建gateway连接
            gateway = Gateway.newInstance()
                    .identity(identity)
                    .signer(signer)
                    .hash(Hash.SHA256)
                    .connection(channel)
                    .evaluateOptions(options -> options.withDeadlineAfter(5, TimeUnit.SECONDS))
                    .endorseOptions(options -> options.withDeadlineAfter(15, TimeUnit.SECONDS))
                    .submitOptions(options -> options.withDeadlineAfter(5, TimeUnit.SECONDS))
                    .commitStatusOptions(options -> options.withDeadlineAfter(1, TimeUnit.MINUTES))
                    .connect();
            
            // 获取网络和合约
            network = gateway.getNetwork(blockchainConfig.getChannelName());
            orderContract = network.getContract(blockchainConfig.getOrderChaincodeName());
            financialContract = network.getContract(blockchainConfig.getFinancialChaincodeName());

            // 账本初始化
            orderContract.submitTransaction("InitLedger");
            financialContract.submitTransaction("InitLedger");

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
            orderContract.submitTransaction(
                    "CreateOrder",
                    order.getOrderId(),
                    order.getUserId().toString(),
                    order.getDriverId().toString(),
                    order.getVehicleId().toString(),
                    order.getStartLocation(),
                    order.getDestination(),
                    order.getStatus().toString(),
                    order.getEstimatedPrice().toString(),
                    order.getActualPrice().toString(),
                    order.getCreatedAt().toString(),
                    order.getType(),
                    order.getUpdatedAt().toString());
            
            logger.info("[BlockchainService] 订单信息上链成功: 订单ID={}", order.getOrderId());
            return true;
        } catch (Exception e) {
            logger.error("[BlockchainService] 订单上链失败: {}", e.getMessage(), e);
            return false;
        }
    }

    @Override
    public boolean saveOrderOnBlockchain(Order order) {
        try {
            logger.info("[BlockchainService] 保存订单信息: 订单ID={}", order.getOrderId());
            orderContract.submitTransaction(
                    "UpdateOrder",
                    order.getOrderId(),
                    order.getUserId().toString(),
                    order.getDriverId().toString(),
                    order.getVehicleId().toString(),
                    order.getStartLocation(),
                    order.getDestination(),
                    order.getStatus().toString(),
                    order.getEstimatedPrice().toString(),
                    order.getActualPrice().toString(),
                    order.getCreatedAt().toString(),
                    order.getType(),
                    order.getUpdatedAt().toString());

            logger.info("[BlockchainService] 订单信息保存成功: 订单ID={}", order.getOrderId());
            return true;
        } catch (Exception e)
        {
            logger.error("[BlockchainService] 订单保存失败: {}", e.getMessage(), e);
            return false;
        }
    }

    @Override
    public boolean createUserTransactionOnBlockchain(Financial userFinancial) {
        try {
            logger.info("[BlockchainService] 开始将用户交易信息上链: 用户ID={}, 金额={}", userFinancial.getUserId(), userFinancial.getAmount());
            String financialId = userFinancial.getFinancialId().toString();
            String userId = userFinancial.getUserId().toString();
            String amount = userFinancial.getAmount().toString();
            String timestamp = String.valueOf(userFinancial.getTransactionTime());
            // 调用金融链码的CreateAsset方法（用户交易）
            financialContract.submitTransaction("CreateAsset", financialId, userId, "User", "Expenses", amount, timestamp);
            
            logger.info("[BlockchainService] 用户交易信息上链成功: 用户ID={}", userId);
            return true;
        } catch (Exception e) {
            logger.error("[BlockchainService] 用户交易上链失败: {}", e.getMessage(), e);
            return false;
        }
    }
    
    @Override
    public boolean createDriverTransactionOnBlockchain(Financial driverFinancial) {
        try {
            logger.info("[BlockchainService] 开始将车主交易信息上链: 车主ID={}, 金额={}", driverFinancial.getUserId(), driverFinancial.getAmount());

            String financialId = driverFinancial.getFinancialId().toString();
            String driverId = driverFinancial.getUserId().toString();
            String amount = driverFinancial.getAmount().toString();
            String timestamp = String.valueOf(driverFinancial.getTransactionTime());

            // 调用金融链码的CreateAsset方法（车主交易）
            financialContract.submitTransaction("CreateAsset", financialId, driverId, "Driver", "Earnings", amount, timestamp);
            
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
            byte[] result = orderContract.evaluateTransaction("QueryAllOrders");
            String ordersJson = new String(result);
            List<Order> orders = objectMapper.readValue(ordersJson, new TypeReference<List<Order>>() {});
            // 这里需要根据实际返回的数据结构进行解析
            logger.info("[BlockchainService] 区块链已完成订单查询完成");
            return orders; // 实际应从区块链获取数据并解析
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
            // 调用金融链码的GetTotalAmount方法
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
            // 调用金融链码的GetTotalAmountByDriver方法
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

    private static X509Certificate readX509Certificate(final Path certificatePath) throws IOException, CertificateException {
        try (Reader certificateReader = Files.newBufferedReader(certificatePath, StandardCharsets.UTF_8)) {
            return Identities.readX509Certificate(certificateReader);
        }
    }

    private static PrivateKey getPrivateKey(final Path privateKeyPath) throws IOException, InvalidKeyException {
        try (Reader privateKeyReader = Files.newBufferedReader(privateKeyPath, StandardCharsets.UTF_8)) {
            return Identities.readPrivateKey(privateKeyReader);
        }
    }
}