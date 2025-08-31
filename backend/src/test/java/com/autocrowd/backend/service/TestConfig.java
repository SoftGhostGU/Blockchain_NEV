package com.autocrowd.backend.service;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;

@TestConfiguration
public class TestConfig {
    
    @Bean
    @Primary
    public PairingBasedCryptosystem pairingBasedCryptosystem() {
        return new PairingBasedCryptosystem();
    }
}