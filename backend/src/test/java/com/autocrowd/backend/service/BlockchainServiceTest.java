package com.autocrowd.backend.service;

import com.autocrowd.backend.entity.Order;
import com.autocrowd.backend.service.impl.BlockchainServiceImpl;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateSerializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalTimeSerializer;
import org.hyperledger.fabric.client.Contract;
import org.hyperledger.fabric.client.Gateway;
import org.hyperledger.fabric.client.Network;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;

class BlockchainServiceTest {

    private BlockchainService blockchainService;

    private ObjectMapper realObjectMapper;

    @Mock
    private Gateway gateway;

    @Mock
    private Network network;

    @Mock
    private Contract orderContract;

    @Mock
    private Contract financialContract;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        blockchainService = new BlockchainServiceImpl();

        try {
            java.lang.reflect.Field orderContractField = BlockchainServiceImpl.class.getDeclaredField("orderContract");
            orderContractField.setAccessible(true);
            orderContractField.set(blockchainService, orderContract);

            java.lang.reflect.Field financialContractField = BlockchainServiceImpl.class.getDeclaredField("financialContract");
            financialContractField.setAccessible(true);
            financialContractField.set(blockchainService, financialContract);

            java.lang.reflect.Field gatewayField = BlockchainServiceImpl.class.getDeclaredField("gateway");
            gatewayField.setAccessible(true);
            gatewayField.set(blockchainService, gateway);

            java.lang.reflect.Field networkField = BlockchainServiceImpl.class.getDeclaredField("network");
            networkField.setAccessible(true);
            networkField.set(blockchainService, network);

        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        realObjectMapper = new ObjectMapper();
        JavaTimeModule javaTimeModule = new JavaTimeModule();
        javaTimeModule.addSerializer(LocalDate.class, new LocalDateSerializer(DateTimeFormatter.ofPattern("yyyy-MM-dd")));
        javaTimeModule.addSerializer(LocalDateTime.class, new LocalDateTimeSerializer(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        javaTimeModule.addSerializer(LocalTime.class, new LocalTimeSerializer(DateTimeFormatter.ofPattern("HH:mm:ss")));
        realObjectMapper.registerModule(javaTimeModule);

        try {
            java.lang.reflect.Field objectMapperField = BlockchainServiceImpl.class.getDeclaredField("objectMapper");
            objectMapperField.setAccessible(true);
            objectMapperField.set(blockchainService, realObjectMapper);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @AfterEach
    void tearDown() {
    }

    @Test
    void createOrderOnBlockchain() {
        Order order = new Order();
        order.setOrderId("123");
        order.setDestination("ShanghaiPudongAirport");
        order.setStartLocation("EastChinaNormalUniversity");
        order.setCreatedAt(LocalDateTime.now());
        order.setEstimatedPrice(new BigDecimal("100.00"));

        boolean result = blockchainService.createOrderOnBlockchain(order);
        assertTrue(result);
    }

    @Test
    void createUserTransactionOnBlockchain() {
    }

    @Test
    void createDriverTransactionOnBlockchain() {
    }

    @Test
    void getCompletedOrdersFromBlockchain() {
    }

    @Test
    void getTotalTransactionAmountFromBlockchain() {
    }

    @Test
    void getTotalTransactionAmountByDriverFromBlockchain() {
    }
}