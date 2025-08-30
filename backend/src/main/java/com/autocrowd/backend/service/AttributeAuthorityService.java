package com.autocrowd.backend.service;

import com.autocrowd.backend.entity.AttributeAuthority;

import java.util.List;

public interface AttributeAuthorityService {
    /**
     * 初始化属性权威机构
     * @param authorityName 权威机构名称
     * @return 创建的权威机构实体
     */
    AttributeAuthority initializeAuthority(String authorityName);

    /**
     * 获取属性权威机构
     * @param authorityName 权威机构名称
     * @return 权威机构实体
     */
    AttributeAuthority getAuthority(String authorityName);

    /**
     * 为指定属性生成属性密钥
     * @param authorityName 权威机构名称
     * @param attributes 属性列表
     * @return 生成的属性密钥列表
     */
    List<String> generateAttributeKeys(String authorityName, List<String> attributes);

    /**
     * 为用户生成属性密钥
     * @param authorityName 权威机构名称
     * @param userId 用户ID
     * @param attributes 用户属性列表（实际会转换为USER_{userId}格式）
     * @return 生成的属性密钥列表
     */
    List<String> generateUserAttributeKeys(String authorityName, Long userId, List<String> attributes);

    /**
     * 为车主生成属性密钥
     * @param authorityName 权威机构名称
     * @param driverId 车主ID
     * @param attributes 车主属性列表（实际会转换为DRIVER_{driverId}格式）
     * @return 生成的属性密钥列表
     */
    List<String> generateDriverAttributeKeys(String authorityName, Long driverId, List<String> attributes);

    /**
     * 获取权威机构的公钥
     * @param authorityName 权威机构名称
     * @return 公钥
     */
    String getPublicKey(String authorityName);
}