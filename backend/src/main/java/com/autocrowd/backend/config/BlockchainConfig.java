package com.autocrowd.backend.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "fabric")
public class BlockchainConfig {
    private String mspId;
    private String channelName;
    private String orderChaincodeName;
    private String financialChaincodeName;
    private String cryptoPath;
    private String certDirPath;
    private String keyDirPath;
    private String tlsCertPath;
    private String peerEndpoint;
    private String peerHostAlias;
}