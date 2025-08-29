package com.autocrowd.backend.config;

import io.grpc.Grpc;
import io.grpc.ManagedChannel;
import io.grpc.TlsChannelCredentials;
import lombok.Data;

import org.hyperledger.fabric.client.identity.*;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.InvalidKeyException;
import java.security.cert.CertificateException;


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

    public static ManagedChannel newGrpcConnection(final Path TLS_CERT_PATH, final String PEER_ENDPOINT, final String OVERRIDE_AUTH) throws IOException {
        var credentials = TlsChannelCredentials.newBuilder()
                .trustManager(TLS_CERT_PATH.toFile())
                .build();
        return Grpc.newChannelBuilder(PEER_ENDPOINT, credentials)
                .overrideAuthority(OVERRIDE_AUTH)
                .build();
    }

    public static Identity newIdentity(final Path CERT_DIR_PATH, final String MSP_ID) throws IOException, CertificateException {
        try (var certReader = Files.newBufferedReader(getFirstFilePath(CERT_DIR_PATH))) {
            var certificate = Identities.readX509Certificate(certReader);
            return new X509Identity(MSP_ID, certificate);
        }
    }

    public static Signer newSigner(final Path KEY_DIR_PATH) throws IOException, InvalidKeyException {
        try (var keyReader = Files.newBufferedReader(getFirstFilePath(KEY_DIR_PATH))) {
            var privateKey = Identities.readPrivateKey(keyReader);
            return Signers.newPrivateKeySigner(privateKey);
        }
    }

    private static Path getFirstFilePath(Path dirPath) throws IOException {
        try (var keyFiles = Files.list(dirPath)) {
            return keyFiles.findFirst().orElseThrow();
        }
    }
}