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
    `pref_quiet`     tinyint(1) NULL DEFAULT NULL,
    `pref_speed`     tinyint(1) NULL DEFAULT NULL,
    `pref_car_type`  tinyint(1) NULL DEFAULT NULL,
    PRIMARY KEY (`user_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for drivers
-- ----------------------------
DROP TABLE IF EXISTS `drivers`;
CREATE TABLE `drivers`
(
    `driver_id`               int          NOT NULL AUTO_INCREMENT,
    `username`                varchar(50)  NOT NULL UNIQUE,
    `password`                varchar(255) NOT NULL,
    `phone`                   varchar(20)  NOT NULL UNIQUE,
    `credit_score`            int            DEFAULT 100,
    `wallet_balance`          decimal(10, 2) DEFAULT 0.00,
    `bank_card`               varchar(50) NULL DEFAULT NULL,
    `created_at`              datetime     NOT NULL,
    `updated_at`              datetime NULL DEFAULT NULL,
    `driver_service_quality`  tinyint(1) NULL DEFAULT NULL,
    `driver_punctuality`      tinyint(1) NULL DEFAULT NULL,
    `driver_rating_avg`       decimal(3, 2) NULL DEFAULT NULL,
    `driver_order_count`      int NULL DEFAULT NULL,
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
    `vehicle_id`      int         NOT NULL AUTO_INCREMENT,
    `driver_id`       int         NOT NULL,
    `license_plate`   varchar(20) NOT NULL UNIQUE,
    `fuel_level`      int         NOT NULL DEFAULT 85,
    `condition_id`    int         NOT NULL,
    `audit_status`    tinyint NULL DEFAULT 1,
    `car_cleanliness` tinyint(1) NULL DEFAULT NULL,
    `car_type`        tinyint NULL DEFAULT NULL,
    `lat`             decimal(10, 8) NULL DEFAULT NULL,
    `lon`             decimal(11, 8) NULL DEFAULT NULL,
    `created_at`      datetime    NOT NULL,
    `updated_at`      datetime NULL DEFAULT NULL,
    PRIMARY KEY (`vehicle_id`) USING BTREE,
    INDEX             `idx_driver_id`(`driver_id` ASC) USING BTREE,
    INDEX             `idx_condition_id`(`condition_id` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for orders
-- ----------------------------
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders`
(
    `order_id`           varchar(20)  NOT NULL,
    `user_id`            int NULL DEFAULT NULL,
    `driver_id`          int NULL DEFAULT NULL,
    `vehicle_id`         int NULL DEFAULT NULL,
    `start_location`     varchar(255) NOT NULL,
    `destination`        varchar(255) NOT NULL,
    `status`             tinyint NULL DEFAULT 0,
    `estimated_price`    decimal(38, 2) NULL DEFAULT NULL,
    `actual_price`       decimal(38, 2) NULL DEFAULT NULL,
    `type`               varchar(255) NULL DEFAULT NULL,
    `created_at`         timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`         timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `estimated_time`     int NULL DEFAULT NULL,
    `actual_time`        int NULL DEFAULT NULL,
    `access_policy`      varchar(255) NULL DEFAULT NULL COMMENT 'IBE访问策略',
    `user_credit`        int NULL DEFAULT NULL,
    `user_pref_quiet`    tinyint(1) NULL DEFAULT NULL,
    `user_pref_speed`    tinyint(1) NULL DEFAULT NULL,
    `user_pref_car_type` tinyint(1) NULL DEFAULT NULL,
    `start_lat`          decimal(10, 8) NULL DEFAULT NULL,
    `start_lon`          decimal(11, 8) NULL DEFAULT NULL,
    `dest_lat`           decimal(10, 8) NULL DEFAULT NULL,
    `dest_lon`           decimal(11, 8) NULL DEFAULT NULL,
    PRIMARY KEY (`order_id`) USING BTREE,
    INDEX                `user_id`(`user_id` ASC) USING BTREE,
    INDEX                `driver_id`(`driver_id` ASC) USING BTREE,
    INDEX                `vehicle_id`(`vehicle_id` ASC) USING BTREE
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

SET
FOREIGN_KEY_CHECKS = 1;