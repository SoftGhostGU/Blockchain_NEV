package com.autocrowd.backend.repository;

import com.autocrowd.backend.entity.AttributeAuthority;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AttributeAuthorityRepository extends JpaRepository<AttributeAuthority, Long> {
    /**
     * 根据权威机构名称查找
     * @param authorityName 权威机构名称
     * @return 权威机构实体
     */
    Optional<AttributeAuthority> findByAuthorityName(String authorityName);
}