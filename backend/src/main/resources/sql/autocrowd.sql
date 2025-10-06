-- ============================================================================
-- Blockchain_NEV 完整数据库结构和测试数据生成脚本
-- 版本: 2.0 (包含车辆注册功能修改)
-- 创建时间: 2025-10-02
-- 说明: 包含最新的数据库结构和完整的测试数据
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 0;
SET NAMES utf8mb4;

-- ============================================================================
-- 用户表 (users)
-- ============================================================================
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`
(
    `user_id`        int          NOT NULL AUTO_INCREMENT COMMENT '用户主键ID',
    `username`       varchar(50)  NOT NULL UNIQUE COMMENT '用户名',
    `password`       varchar(255) NOT NULL COMMENT '密码(已加密)',
    `phone`          varchar(20)  NOT NULL UNIQUE COMMENT '手机号',
    `credit_score`   int               DEFAULT 100 COMMENT '信誉分',
    `wallet_balance` decimal(10, 2)    DEFAULT 0.00 COMMENT '钱包余额',
    `balance`        decimal(10, 2)    DEFAULT 0.00 COMMENT '账户余额',
    `created_at`     datetime     NOT NULL COMMENT '创建时间',
    `updated_at`     datetime     NULL DEFAULT NULL COMMENT '更新时间',
    `pref_quiet`     tinyint(1)   NULL DEFAULT NULL COMMENT '偏好-安静(0=否,1=是)',
    `pref_speed`     tinyint(1)   NULL DEFAULT NULL COMMENT '偏好-速度(0=否,1=是)',
    `pref_car_type`  tinyint(1)   NULL DEFAULT NULL COMMENT '偏好-车型(0=否,1=是)',
    PRIMARY KEY (`user_id`) USING BTREE,
    INDEX `idx_username` (`username`) USING BTREE,
    INDEX `idx_phone` (`phone`) USING BTREE
) ENGINE = InnoDB
  AUTO_INCREMENT = 1000
  CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_unicode_ci COMMENT = '用户信息表'
  ROW_FORMAT = Dynamic;

-- ============================================================================
-- 车主表 (drivers)
-- ============================================================================
DROP TABLE IF EXISTS `drivers`;
CREATE TABLE `drivers`
(
    `driver_id`              int           NOT NULL AUTO_INCREMENT COMMENT '车主主键ID',
    `username`               varchar(50)   NOT NULL UNIQUE COMMENT '车主用户名',
    `password`               varchar(255)  NOT NULL COMMENT '密码(已加密)',
    `phone`                  varchar(20)   NOT NULL UNIQUE COMMENT '手机号',
    `credit_score`           int                DEFAULT 100 COMMENT '信誉分',
    `wallet_balance`         decimal(10, 2)     DEFAULT 0.00 COMMENT '钱包余额',
    `bank_card`              varchar(50)   NULL DEFAULT NULL COMMENT '银行卡号',
    `created_at`             datetime      NOT NULL COMMENT '创建时间',
    `updated_at`             datetime      NULL DEFAULT NULL COMMENT '更新时间',
    `driver_service_quality` tinyint(1)    NULL DEFAULT NULL COMMENT '服务质量评分',
    `driver_punctuality`     tinyint(1)    NULL DEFAULT NULL COMMENT '准时性评分',
    `driver_rating_avg`      decimal(3, 2) NULL DEFAULT NULL COMMENT '平均评分',
    `driver_order_count`     int           NULL DEFAULT 0 COMMENT '订单数量',
    PRIMARY KEY (`driver_id`) USING BTREE,
    INDEX `idx_username` (`username`) USING BTREE,
    INDEX `idx_phone` (`phone`) USING BTREE
) ENGINE = InnoDB
  AUTO_INCREMENT = 2000
  CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_unicode_ci COMMENT = '车主信息表'
  ROW_FORMAT = Dynamic;

-- ============================================================================
-- 车辆状况表 (vehicle_condition) - 最新结构
-- ============================================================================
DROP TABLE IF EXISTS `vehicle_condition`;
CREATE TABLE `vehicle_condition`
(
    `condition_id`    int          NOT NULL AUTO_INCREMENT COMMENT '状况主键ID',
    `vehicle_model`   varchar(100) NULL DEFAULT NULL COMMENT '车辆型号(如:特斯拉 Model 3)',
    `battery_percent` tinyint      NULL DEFAULT 85 COMMENT '电池百分比(0-100)',
    `miles_to_go`     varchar(50)  NULL DEFAULT NULL COMMENT '续航里程',
    `body_state`      tinyint      NULL DEFAULT 1 COMMENT '车身状态(1=正常,2=注意,3=危险)',
    `tire_pressure`   tinyint      NULL DEFAULT 1 COMMENT '轮胎气压(1=正常,2=注意,3=危险)',
    `brake_state`     tinyint      NULL DEFAULT 1 COMMENT '制动系统(1=正常,2=注意,3=危险)',
    `power_state`     tinyint      NULL DEFAULT 1 COMMENT '动力系统(1=正常,2=注意,3=危险)',
    PRIMARY KEY (`condition_id`) USING BTREE,
    CONSTRAINT `chk_body_state` CHECK (`body_state` BETWEEN 1 AND 3),
    CONSTRAINT `chk_tire_pressure` CHECK (`tire_pressure` BETWEEN 1 AND 3),
    CONSTRAINT `chk_brake_state` CHECK (`brake_state` BETWEEN 1 AND 3),
    CONSTRAINT `chk_power_state` CHECK (`power_state` BETWEEN 1 AND 3)
) ENGINE = InnoDB
  AUTO_INCREMENT = 3000
  CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_unicode_ci COMMENT = '车辆状况信息表'
  ROW_FORMAT = Dynamic;

-- ============================================================================
-- 车辆表 (vehicles)
-- ============================================================================
DROP TABLE IF EXISTS `vehicles`;
CREATE TABLE `vehicles`
(
    `vehicle_id`      int            NOT NULL AUTO_INCREMENT COMMENT '车辆主键ID',
    `driver_id`       int            NOT NULL COMMENT '车主ID',
    `license_plate`   varchar(20)    NOT NULL UNIQUE COMMENT '车牌号',
    `fuel_level`      int            NOT NULL DEFAULT 100 COMMENT '燃油/电量水平(0-100)',
    `condition_id`    int            NOT NULL COMMENT '车辆状况ID',
    `audit_status`    tinyint        NULL     DEFAULT 1 COMMENT '审核状态(1=待审核,2=已通过,3=已拒绝)',
    `car_cleanliness` tinyint(1)     NULL     DEFAULT NULL COMMENT '车辆清洁度',
    `car_type`        tinyint        NULL     DEFAULT NULL COMMENT '车辆类型',
    `lat`             decimal(10, 8) NULL     DEFAULT NULL COMMENT '纬度',
    `lon`             decimal(11, 8) NULL     DEFAULT NULL COMMENT '经度',
    `created_at`      datetime       NOT NULL COMMENT '创建时间',
    `updated_at`      datetime       NULL     DEFAULT NULL COMMENT '更新时间',
    PRIMARY KEY (`vehicle_id`) USING BTREE,
    INDEX `idx_driver_id` (`driver_id`) USING BTREE,
    INDEX `idx_condition_id` (`condition_id`) USING BTREE,
    INDEX `idx_license_plate` (`license_plate`) USING BTREE,
    INDEX `idx_audit_status` (`audit_status`) USING BTREE
) ENGINE = InnoDB
  AUTO_INCREMENT = 4000
  CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_unicode_ci COMMENT = '车辆信息表'
  ROW_FORMAT = Dynamic;

-- ============================================================================
-- 订单表 (orders)
-- ============================================================================
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders`
(
    `order_id`           varchar(20)    NOT NULL COMMENT '订单ID',
    `user_id`            int            NULL DEFAULT NULL COMMENT '用户ID',
    `driver_id`          int            NULL DEFAULT NULL COMMENT '车主ID',
    `vehicle_id`         int            NULL DEFAULT NULL COMMENT '车辆ID',
    `start_location`     varchar(255)   NOT NULL COMMENT '出发地',
    `destination`        varchar(255)   NOT NULL COMMENT '目的地',
    `status`             tinyint        NULL DEFAULT 0 COMMENT '状态(0=等待中,1=已接单,2=进行中,3=已完成,4=已取消)',
    `estimated_price`    decimal(10, 2) NULL DEFAULT NULL COMMENT '预估价格',
    `actual_price`       decimal(10, 2) NULL DEFAULT NULL COMMENT '实际价格',
    `type`               varchar(50)    NULL DEFAULT '网约车' COMMENT '订单类型',
    `created_at`         timestamp      NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at`         timestamp      NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `estimated_time`     int            NULL DEFAULT NULL COMMENT '预估时间(分钟)',
    `actual_time`        int            NULL DEFAULT NULL COMMENT '实际时间(分钟)',
    `access_policy`      varchar(255)   NULL DEFAULT NULL COMMENT 'IBE访问策略',
    `user_credit`        int            NULL DEFAULT NULL COMMENT '用户信誉分',
    `user_pref_quiet`    tinyint(1)     NULL DEFAULT NULL COMMENT '用户偏好-安静',
    `user_pref_speed`    tinyint(1)     NULL DEFAULT NULL COMMENT '用户偏好-速度',
    `user_pref_car_type` tinyint(1)     NULL DEFAULT NULL COMMENT '用户偏好-车型',
    `start_lat`          decimal(10, 8) NULL DEFAULT NULL COMMENT '出发地纬度',
    `start_lon`          decimal(11, 8) NULL DEFAULT NULL COMMENT '出发地经度',
    `dest_lat`           decimal(10, 8) NULL DEFAULT NULL COMMENT '目的地纬度',
    `dest_lon`           decimal(11, 8) NULL DEFAULT NULL COMMENT '目的地经度',
    PRIMARY KEY (`order_id`) USING BTREE,
    INDEX `idx_user_id` (`user_id`) USING BTREE,
    INDEX `idx_driver_id` (`driver_id`) USING BTREE,
    INDEX `idx_vehicle_id` (`vehicle_id`) USING BTREE,
    INDEX `idx_status` (`status`) USING BTREE,
    INDEX `idx_type` (`type`) USING BTREE,
    INDEX `idx_created_at` (`created_at`) USING BTREE
) ENGINE = InnoDB
  CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_unicode_ci COMMENT = '订单信息表'
  ROW_FORMAT = Dynamic;

-- ============================================================================
-- 财务记录表 (financials)
-- ============================================================================
DROP TABLE IF EXISTS `financials`;
CREATE TABLE `financials`
(
    `financial_id`     int                                                  NOT NULL AUTO_INCREMENT COMMENT '财务记录主键ID',
    `user_id`          int                                                  NULL DEFAULT NULL COMMENT '用户ID',
    `role`             varchar(50)                                          NULL DEFAULT NULL COMMENT '角色(user/driver)',
    `transaction_type` enum ('Expenses','Withdrawal','Earnings','Recharge') NOT NULL COMMENT '交易类型',
    `amount`           decimal(10, 2)                                       NOT NULL COMMENT '金额',
    `transaction_time` timestamp                                            NULL DEFAULT CURRENT_TIMESTAMP COMMENT '交易时间',
    PRIMARY KEY (`financial_id`) USING BTREE,
    INDEX `idx_user_id` (`user_id`) USING BTREE,
    INDEX `idx_role` (`role`) USING BTREE,
    INDEX `idx_transaction_type` (`transaction_type`) USING BTREE,
    INDEX `idx_transaction_time` (`transaction_time`) USING BTREE
) ENGINE = InnoDB
  AUTO_INCREMENT = 5000
  CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_unicode_ci COMMENT = '财务记录表'
  ROW_FORMAT = Dynamic;

-- ============================================================================
-- 评价表 (reviews)
-- ============================================================================
DROP TABLE IF EXISTS `reviews`;
CREATE TABLE `reviews`
(
    `review_id`    int           NOT NULL AUTO_INCREMENT COMMENT '评价主键ID',
    `order_id`     varchar(20)   NULL DEFAULT NULL COMMENT '订单ID',
    `user_id`      int           NULL DEFAULT NULL COMMENT '用户ID',
    `driver_id`    int           NULL DEFAULT NULL COMMENT '车主ID',
    `content`      varchar(500)  NULL DEFAULT NULL COMMENT '评价内容',
    `created_at`   timestamp     NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at`   timestamp     NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `comment_star` decimal(2, 1) NULL DEFAULT NULL COMMENT '评分(1-5星)',
    `audit_status` tinyint       NULL DEFAULT 1 COMMENT '审核状态(1=待审核,2=已通过,3=已拒绝)',
    PRIMARY KEY (`review_id`) USING BTREE,
    INDEX `idx_order_id` (`order_id`) USING BTREE,
    INDEX `idx_user_id` (`user_id`) USING BTREE,
    INDEX `idx_driver_id` (`driver_id`) USING BTREE,
    INDEX `idx_audit_status` (`audit_status`) USING BTREE,
    CONSTRAINT `chk_comment_star` CHECK (`comment_star` BETWEEN 1 AND 5)
) ENGINE = InnoDB
  AUTO_INCREMENT = 6000
  CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_unicode_ci COMMENT = '评价信息表'
  ROW_FORMAT = Dynamic;

SET FOREIGN_KEY_CHECKS = 1;

ALTER TABLE vehicles ADD COLUMN status TINYINT DEFAULT 1 COMMENT '车辆状态(1=可接单,2=不可接单)' AFTER audit_status;