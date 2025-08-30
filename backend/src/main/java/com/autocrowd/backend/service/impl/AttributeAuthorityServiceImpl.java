package com.autocrowd.backend.service.impl;

import com.autocrowd.backend.entity.AttributeAuthority;
import com.autocrowd.backend.repository.AttributeAuthorityRepository;
import com.autocrowd.backend.service.AttributeAuthorityService;
import com.autocrowd.backend.util.EncryptionUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Optional;

@Service
public class AttributeAuthorityServiceImpl implements AttributeAuthorityService {

    @Autowired
    private AttributeAuthorityRepository attributeAuthorityRepository;

    @Override
    public AttributeAuthority initializeAuthority(String authorityName) {
        // 检查是否已存在同名的权威机构
        Optional<AttributeAuthority> existingAuthority = attributeAuthorityRepository.findByAuthorityName(authorityName);
        if (existingAuthority.isPresent()) {
            return existingAuthority.get();
        }

        // 创建新的属性权威机构
        AttributeAuthority authority = new AttributeAuthority();
        authority.setAuthorityName(authorityName);

        // 生成主密钥和公钥（简化实现，实际应该使用更复杂的密钥体系）
        String masterKey = generateMasterKey();
        String publicKey = generatePublicKey();

        authority.setMasterKey(masterKey);
        authority.setPublicKey(publicKey);
        authority.setCreatedAt(LocalDateTime.now());

        return attributeAuthorityRepository.save(authority);
    }

    @Override
    public AttributeAuthority getAuthority(String authorityName) {
        Optional<AttributeAuthority> authority = attributeAuthorityRepository.findByAuthorityName(authorityName);
        return authority.orElse(null);
    }

    @Override
    public List<String> generateAttributeKeys(String authorityName, List<String> attributes) {
        AttributeAuthority authority = getAuthority(authorityName);
        if (authority == null) {
            throw new RuntimeException("属性权威机构不存在: " + authorityName);
        }

        List<String> attributeKeys = new ArrayList<>();
        for (String attribute : attributes) {
            // 使用权威机构的主密钥生成属性密钥
            String attributeKey = generateAttributeKey(authority.getMasterKey(), attribute);
            attributeKeys.add(attributeKey);
        }

        return attributeKeys;
    }

    @Override
    public List<String> generateUserAttributeKeys(String authorityName, Long userId, List<String> attributes) {
        AttributeAuthority authority = getAuthority(authorityName);
        if (authority == null) {
            throw new RuntimeException("属性权威机构不存在: " + authorityName);
        }

        List<String> attributeKeys = new ArrayList<>();
        for (String attribute : attributes) {
            // 为用户生成特定的属性密钥
            String userAttribute = "USER_" + userId;
            String attributeKey = generateAttributeKey(authority.getMasterKey(), userAttribute);
            attributeKeys.add(attributeKey);
        }

        return attributeKeys;
    }

    @Override
    public List<String> generateDriverAttributeKeys(String authorityName, Long driverId, List<String> attributes) {
        AttributeAuthority authority = getAuthority(authorityName);
        if (authority == null) {
            throw new RuntimeException("属性权威机构不存在: " + authorityName);
        }

        List<String> attributeKeys = new ArrayList<>();
        for (String attribute : attributes) {
            // 为车主生成特定的属性密钥
            String driverAttribute = "DRIVER_" + driverId;
            String attributeKey = generateAttributeKey(authority.getMasterKey(), driverAttribute);
            attributeKeys.add(attributeKey);
        }

        return attributeKeys;
    }

    @Override
    public String getPublicKey(String authorityName) {
        AttributeAuthority authority = getAuthority(authorityName);
        if (authority == null) {
            throw new RuntimeException("属性权威机构不存在: " + authorityName);
        }
        return authority.getPublicKey();
    }

    /**
     * 生成主密钥
     * @return 主密钥（Base64编码）
     */
    private String generateMasterKey() {
        try {
            KeyGenerator keyGen = KeyGenerator.getInstance("AES");
            keyGen.init(256);
            SecretKey key = keyGen.generateKey();
            return Base64.getEncoder().encodeToString(key.getEncoded());
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("生成主密钥失败", e);
        }
    }

    /**
     * 生成公钥（简化实现）
     * @return 公钥（Base64编码）
     */
    private String generatePublicKey() {
        // 在实际实现中，这应该是基于主密钥生成的公钥
        // 这里简化为生成一个随机密钥作为公钥
        return EncryptionUtil.generateKey();
    }

    /**
     * 基于主密钥和属性生成属性密钥
     * @param masterKey 主密钥
     * @param attribute 属性
     * @return 属性密钥（Base64编码）
     */
    private String generateAttributeKey(String masterKey, String attribute) {
        // 在实际实现中，应该使用更复杂的算法基于主密钥和属性生成属性密钥
        // 这里简化为使用属性和主密钥的某种组合生成密钥
        String combined = masterKey + attribute;
        return Base64.getEncoder().encodeToString(combined.getBytes());
    }
}