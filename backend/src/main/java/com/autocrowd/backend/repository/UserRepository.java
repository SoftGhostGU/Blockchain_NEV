package com.autocrowd.backend.repository;

import com.autocrowd.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

/**
 * 用户数据访问接口
 * 提供用户实体的CRUD操作及自定义查询方法
 * 继承JpaRepository，包含基本的数据库操作方法
 */
@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    /**
 * 根据用户名查询用户
 * @param username 用户名
 * @return 包含用户实体的Optional对象
 */
Optional<User> findByUsername(String username);
    /**
 * 根据手机号查询用户
 * @param phone 手机号
 * @return 包含用户实体的Optional对象
 */
Optional<User> findByPhone(String phone);
    /**
 * 检查用户名是否已存在
 * @param username 用户名
 * @return 用户名存在返回true，否则返回false
 */
boolean existsByUsername(String username);
    /**
 * 检查手机号是否已存在
 * @param phone 手机号
 * @return 手机号存在返回true，否则返回false
 */
boolean existsByPhone(String phone);
}