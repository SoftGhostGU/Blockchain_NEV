SET NAMES utf8mb4;
SET
FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`
(
    `user_id`        int          NOT NULL AUTO_INCREMENT,
    `username`       varchar(50)  NOT NULL UNIQUE,
    `password`       varchar(255) NOT NULL,
    `phone`          varchar(20)  NOT NULL UNIQUE,
    `credit_score`   int            DEFAULT 100,
    `wallet_balance` decimal(10, 2) DEFAULT 0.00,
    `balance`        decimal(10, 2) DEFAULT 0.00,
    `created_at`     datetime     NOT NULL,
    `updated_at`     datetime NULL DEFAULT NULL,
    PRIMARY KEY (`user_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for drivers
-- ----------------------------
DROP TABLE IF EXISTS `drivers`;
CREATE TABLE `drivers`
(
    `driver_id`      int          NOT NULL AUTO_INCREMENT,
    `username`       varchar(50)  NOT NULL UNIQUE,
    `password`       varchar(255) NOT NULL,
    `phone`          varchar(20)  NOT NULL UNIQUE,
    `credit_score`   int            DEFAULT 100,
    `wallet_balance` decimal(10, 2) DEFAULT 0.00,
    `bank_card`      varchar(50) NULL DEFAULT NULL,
    `created_at`     datetime     NOT NULL,
    `updated_at`     datetime NULL DEFAULT NULL,
    PRIMARY KEY (`driver_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for vehicle_condition
-- ----------------------------
DROP TABLE IF EXISTS `vehicle_condition`;
CREATE TABLE `vehicle_condition`
(
    `condition_id`    int NOT NULL AUTO_INCREMENT,
    `battery_percent` tinyint NULL DEFAULT 85,
    `miles_to_go`     varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
    `body_state`      tinyint NULL DEFAULT 0,
    `tire_pressure`   tinyint NULL DEFAULT 0,
    `brake_state`     tinyint NULL DEFAULT 1,
    `power_state`     tinyint NULL DEFAULT 2,
    PRIMARY KEY (`condition_id`) USING BTREE,
    CONSTRAINT `vehicle_condition_chk_1` CHECK (`body_state` between 0 and 2),
    CONSTRAINT `vehicle_condition_chk_2` CHECK (`tire_pressure` between 0 and 2),
    CONSTRAINT `vehicle_condition_chk_3` CHECK (`brake_state` between 0 and 2),
    CONSTRAINT `vehicle_condition_chk_4` CHECK (`power_state` between 0 and 2)
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for vehicles
-- ----------------------------
DROP TABLE IF EXISTS `vehicles`;
CREATE TABLE `vehicles`
(
    `vehicle_id`    int         NOT NULL AUTO_INCREMENT,
    `driver_id`     int         NOT NULL,
    `license_plate` varchar(20) NOT NULL UNIQUE,
    `fuel_level`    int         NOT NULL DEFAULT 85,
    `condition_id`  int         NOT NULL,
    `audit_status`  tinyint NULL DEFAULT 1,
    `created_at`    datetime    NOT NULL,
    `updated_at`    datetime NULL DEFAULT NULL,
    PRIMARY KEY (`vehicle_id`) USING BTREE,
    INDEX           `idx_driver_id`(`driver_id` ASC) USING BTREE,
    INDEX           `idx_condition_id`(`condition_id` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for orders
-- ----------------------------
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders`
(
    `order_id`        varchar(20)  NOT NULL,
    `user_id`         int NULL DEFAULT NULL,
    `driver_id`       int NULL DEFAULT NULL,
    `vehicle_id`      int NULL DEFAULT NULL,
    `start_location`  varchar(255) NOT NULL,
    `destination`     varchar(255) NOT NULL,
    `status`          tinyint NULL DEFAULT 0,
    `estimated_price` decimal(38, 2) NULL DEFAULT NULL,
    `actual_price`    decimal(38, 2) NULL DEFAULT NULL,
    `type`            varchar(255) NULL DEFAULT NULL,
    `created_at`      timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`      timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `estimated_time`  int NULL DEFAULT NULL,
    `actual_time`     int NULL DEFAULT NULL,
    `access_policy`   varchar(255) NULL DEFAULT NULL COMMENT 'CP-ABE访问策略',
    PRIMARY KEY (`order_id`) USING BTREE,
    INDEX             `user_id`(`user_id` ASC) USING BTREE,
    INDEX             `driver_id`(`driver_id` ASC) USING BTREE,
    INDEX             `vehicle_id`(`vehicle_id` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for financials
-- ----------------------------
DROP TABLE IF EXISTS `financials`;
CREATE TABLE `financials`
(
    `financial_id`     int            NOT NULL AUTO_INCREMENT,
    `user_id`          int NULL DEFAULT NULL,
    `role`             varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
    `transaction_type` enum('Expenses','Withdrawal','Earnings','Recharge') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    `amount`           decimal(10, 2) NOT NULL,
    `transaction_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`financial_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 17 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for reviews
-- ----------------------------
DROP TABLE IF EXISTS `reviews`;
CREATE TABLE `reviews`
(
    `review_id`    int NOT NULL AUTO_INCREMENT,
    `order_id`     varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
    `user_id`      int NULL DEFAULT NULL,
    `driver_id`    int NULL DEFAULT NULL,
    `content`      varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
    `created_at`   timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`   timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `comment_star` decimal(38, 2) NULL DEFAULT NULL,
    `audit_status` tinyint NULL DEFAULT 1,
    PRIMARY KEY (`review_id`) USING BTREE,
    INDEX          `order_id`(`order_id` ASC) USING BTREE,
    INDEX          `user_id`(`user_id` ASC) USING BTREE,
    INDEX          `driver_id`(`driver_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for attribute_authorities
-- ----------------------------
DROP TABLE IF EXISTS `attribute_authorities`;
CREATE TABLE `attribute_authorities`
(
    `id`             bigint       NOT NULL AUTO_INCREMENT,
    `authority_name` varchar(255) NOT NULL UNIQUE COMMENT '权威机构名称',
    `public_key`     text         NOT NULL COMMENT '公钥',
    `master_key`     text         NOT NULL COMMENT '主密钥',
    `created_at`     datetime     NOT NULL,
    `updated_at`     datetime NULL DEFAULT NULL,
    PRIMARY KEY (`id`) USING BTREE,
    INDEX            `idx_authority_name`(`authority_name` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- 测试数据
-- ----------------------------

-- 插入测试用户数据
INSERT INTO `users` (`user_id`, `username`, `password`, `phone`, `credit_score`, `wallet_balance`, `balance`,
                     `created_at`)
VALUES (1, 'testuser', '$2a$10$rOz9HgnsLsy6y5mhhMqiyeQb3IyH2a9.BzDu9dF9w3F29b4rPzJcW', '13800138000', 100, 1000.00,
        1000.00, '2025-01-01 12:00:00'),
       (2, 'alice', '$2a$10$rOz9HgnsLsy6y5mhhMqiyeQb3IyH2a9.BzDu9dF9w3F29b4rPzJcW', '13800138001', 95, 500.00, 500.00,
        '2025-01-01 12:00:00');

-- 插入测试车主数据
INSERT INTO `drivers` (`driver_id`, `username`, `password`, `phone`, `credit_score`, `wallet_balance`, `bank_card`,
                       `created_at`)
VALUES (1, 'testdriver', '$2a$10$rOz9HgnsLsy6y5mhhMqiyeQb3IyH2a9.BzDu9dF9w3F29b4rPzJcW', '13900139000', 100, 2000.00,
        '6222001234567890', '2025-01-01 12:00:00'),
       (2, 'bob', '$2a$10$rOz9HgnsLsy6y5mhhMqiyeQb3IyH2a9.BzDu9dF9w3F29b4rPzJcW', '13900139001', 90, 1500.00,
        '6222000987654321', '2025-01-01 12:00:00');

-- 插入车辆状态数据
INSERT INTO `vehicle_condition` (`condition_id`, `battery_percent`, `miles_to_go`, `body_state`, `tire_pressure`,
                                 `brake_state`, `power_state`)
VALUES (1, 90, '200 miles', 0, 0, 1, 2),
       (2, 85, '150 miles', 0, 0, 1, 2);

-- 插入测试车辆数据
INSERT INTO `vehicles` (`vehicle_id`, `driver_id`, `license_plate`, `fuel_level`, `condition_id`, `audit_status`,
                        `created_at`)
VALUES (1, 1, '粤A12345', 90, 1, 1, '2025-01-01 12:00:00'),
       (2, 2, '粤B67890', 85, 2, 1, '2025-01-01 12:00:00');

-- 插入测试订单数据
INSERT INTO `orders` (`order_id`, `user_id`, `driver_id`, `vehicle_id`, `start_location`, `destination`, `status`,
                      `estimated_price`, `actual_price`, `type`, `created_at`, `updated_at`, `estimated_time`,
                      `actual_time`, `access_policy`)
VALUES ('ORD20250101001', 1, 1, 1, '加密的起始位置数据1', '加密的目的地数据1', 0, 50.00, NULL, '网约车',
        '2025-01-01 12:00:00', '2025-01-01 12:00:00', 30, NULL, 'USER_1'),
       ('ORD20250101002', 2, 2, 2, '加密的起始位置数据2', '加密的目的地数据2', 1, 60.00, NULL, '网约车',
        '2025-01-01 13:00:00', '2025-01-01 13:00:00', 35, NULL, 'USER_2');

-- 插入财务测试数据
INSERT INTO `financials` (`financial_id`, `user_id`, `role`, `transaction_type`, `amount`, `transaction_time`)
VALUES (1, 1, 'user', 'Recharge', 1000.00, '2025-01-01 12:00:00'),
       (2, 1, 'user', 'Expenses', 50.00, '2025-01-01 12:30:00'),
       (3, 2, 'user', 'Recharge', 500.00, '2025-01-01 12:00:00'),
       (4, 1, 'driver', 'Earnings', 45.00, '2025-01-01 12:30:00'),
       (5, 2, 'driver', 'Earnings', 55.00, '2025-01-01 13:30:00');

-- 插入评价测试数据
INSERT INTO `reviews` (`review_id`, `order_id`, `user_id`, `driver_id`, `content`, `created_at`, `comment_star`,
                       `audit_status`)
VALUES (1, 'ORD20250101001', 1, 1, '服务很好，车辆很干净', '2025-01-01 13:00:00', 4.5, 1),
       (2, 'ORD20250101002', 2, 2, '司机很专业，准时到达', '2025-01-01 14:00:00', 5.0, 1);

-- 插入属性权威机构测试数据
INSERT INTO `attribute_authorities` (`id`, `authority_name`, `public_key`, `master_key`, `created_at`)
VALUES (1, 'MainAuthority', '测试公钥数据', '测试主密钥数据', '2025-01-01 12:00:00');

SET
FOREIGN_KEY_CHECKS = 1;