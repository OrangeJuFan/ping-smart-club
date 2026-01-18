/*
 Navicat Premium Data Transfer

 Source Server         : 软件234许轩源202302103050
 Source Server Type    : MySQL
 Source Server Version : 80040 (8.0.40)
 Source Host           : localhost:3306
 Source Schema         : ping-smart-club

 Target Server Type    : MySQL
 Target Server Version : 80040 (8.0.40)
 File Encoding         : 65001

 Date: 18/01/2026 22:31:50
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for admin
-- ----------------------------
DROP TABLE IF EXISTS `admin`;
CREATE TABLE `admin`  (
  `admin_id` int NOT NULL AUTO_INCREMENT COMMENT '管理员id',
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '账号',
  `admin_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '姓名',
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '密码',
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '手机号码',
  PRIMARY KEY (`admin_id`) USING BTREE,
  UNIQUE INDEX `uk_username`(`username` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '管理员信息表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of admin
-- ----------------------------

-- ----------------------------
-- Table structure for attendance_record
-- ----------------------------
DROP TABLE IF EXISTS `attendance_record`;
CREATE TABLE `attendance_record`  (
  `attendance_id` int NOT NULL AUTO_INCREMENT COMMENT '考勤记录ID',
  `session_id` int NOT NULL COMMENT '上课记录ID（关联course_session表）',
  `person_type` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '人员类型：coach-教练/student-学员',
  `person_id` int NOT NULL COMMENT '人员ID',
  `attendance_date` date NOT NULL COMMENT '考勤日期',
  `scheduled_start` time NOT NULL COMMENT '计划开始时间',
  `scheduled_end` time NOT NULL COMMENT '计划结束时间',
  `actual_start` datetime NULL DEFAULT NULL COMMENT '实际开始时间',
  `actual_end` datetime NULL DEFAULT NULL COMMENT '实际结束时间',
  `attendance_status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '未签到' COMMENT '考勤状态：未签到/正常/迟到/早退/请假/缺勤',
  `check_in_method` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '签到方式',
  `check_out_method` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '签退方式',
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '考勤备注',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`attendance_id`) USING BTREE,
  INDEX `idx_session_id`(`session_id` ASC) USING BTREE,
  INDEX `idx_person`(`person_type` ASC, `person_id` ASC) USING BTREE,
  INDEX `idx_attendance_date`(`attendance_date` ASC) USING BTREE,
  INDEX `idx_attendance_status`(`attendance_status` ASC) USING BTREE,
  CONSTRAINT `attendance_record_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `course_session` (`session_id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '考勤记录表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of attendance_record
-- ----------------------------

-- ----------------------------
-- Table structure for club
-- ----------------------------
DROP TABLE IF EXISTS `club`;
CREATE TABLE `club`  (
  `club_id` int NOT NULL AUTO_INCREMENT COMMENT '俱乐部编号',
  `club_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '俱乐部名称',
  `club_address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '地址',
  `contact_phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '联系电话',
  `manager` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '负责人',
  `introduction` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '俱乐部简介',
  PRIMARY KEY (`club_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '俱乐部信息表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of club
-- ----------------------------

-- ----------------------------
-- Table structure for coach
-- ----------------------------
DROP TABLE IF EXISTS `coach`;
CREATE TABLE `coach`  (
  `coach_id` int NOT NULL AUTO_INCREMENT COMMENT '教练编号',
  `coach_name` varchar(55) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '教练姓名',
  `coach_gender` varchar(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '性别',
  `coach_phone` varchar(55) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '联系电话',
  `coach_level` varchar(55) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '教练等级',
  `kaiqiu_score` int NULL DEFAULT NULL COMMENT '开球网积分',
  `lesson_fee` decimal(10, 2) NULL DEFAULT NULL COMMENT '课时费',
  PRIMARY KEY (`coach_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '教练信息表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of coach
-- ----------------------------

-- ----------------------------
-- Table structure for course
-- ----------------------------
DROP TABLE IF EXISTS `course`;
CREATE TABLE `course`  (
  `course_id` int NOT NULL AUTO_INCREMENT COMMENT '课程ID',
  `course_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '课程类型',
  `course_unit` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '课程单位',
  `open_time` datetime NOT NULL COMMENT '开设时间',
  PRIMARY KEY (`course_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '课程信息表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of course
-- ----------------------------

-- ----------------------------
-- Table structure for course_purchase
-- ----------------------------
DROP TABLE IF EXISTS `course_purchase`;
CREATE TABLE `course_purchase`  (
  `purchase_id` int NOT NULL AUTO_INCREMENT COMMENT '购买记录ID（主键）',
  `purchase_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '购买编号（唯一业务编号）',
  `student_id` int NOT NULL COMMENT '学员ID，外键关联student表',
  `coach_id` int NOT NULL COMMENT '教练ID，外键关联coach表',
  `course_id` int NULL DEFAULT NULL COMMENT '课程ID，外键关联course表（可为空）',
  `course_count` int NOT NULL DEFAULT 1 COMMENT '购买课时数',
  `remaining_count` int NOT NULL DEFAULT 0 COMMENT '剩余课时数',
  `unit_price` decimal(10, 2) NOT NULL COMMENT '课时单价',
  `total_amount` decimal(10, 2) NOT NULL COMMENT '总金额',
  `payment_status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '待支付' COMMENT '支付状态：待支付/已支付/支付失败/已退款',
  `purchase_status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '有效' COMMENT '购买状态：有效/已用完/已过期/已取消',
  `payment_method` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '支付方式：微信/支付宝/现金/刷卡',
  `payment_time` datetime NULL DEFAULT NULL COMMENT '支付时间',
  `valid_from` date NOT NULL COMMENT '有效期开始日期',
  `valid_to` date NULL DEFAULT NULL COMMENT '有效期结束日期',
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '购买备注',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`purchase_id`) USING BTREE,
  UNIQUE INDEX `uk_purchase_number`(`purchase_number` ASC) USING BTREE,
  INDEX `idx_student_id`(`student_id` ASC) USING BTREE,
  INDEX `idx_coach_id`(`coach_id` ASC) USING BTREE,
  INDEX `idx_course_id`(`course_id` ASC) USING BTREE,
  INDEX `idx_payment_status`(`payment_status` ASC) USING BTREE,
  INDEX `idx_purchase_status`(`purchase_status` ASC) USING BTREE,
  INDEX `idx_valid_to`(`valid_to` ASC) USING BTREE,
  INDEX `idx_remaining_count`(`remaining_count` ASC) USING BTREE,
  CONSTRAINT `fk_purchase_coach` FOREIGN KEY (`coach_id`) REFERENCES `coach` (`coach_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_purchase_course` FOREIGN KEY (`course_id`) REFERENCES `course` (`course_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_purchase_student` FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '课程购买表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of course_purchase
-- ----------------------------

-- ----------------------------
-- Table structure for course_session
-- ----------------------------
DROP TABLE IF EXISTS `course_session`;
CREATE TABLE `course_session`  (
  `session_id` int NOT NULL AUTO_INCREMENT COMMENT '课程预约ID（主键）',
  `course_id` int NOT NULL COMMENT '课程ID，外键关联course表',
  `student_id` int NOT NULL COMMENT '学员ID，外键关联student表',
  `coach_id` int NOT NULL COMMENT '教练ID，外键关联coach表',
  `club_id` int NOT NULL COMMENT '俱乐部ID，外键关联club表',
  `table_id` int NULL DEFAULT NULL COMMENT '球台ID，外键关联pingpong_table表',
  `venue_id` int NULL DEFAULT NULL COMMENT '场地ID，外键关联venue表',
  `session_date` date NOT NULL COMMENT '上课日期',
  `start_time` time NOT NULL COMMENT '计划开始时间',
  `end_time` time NOT NULL COMMENT '计划结束时间',
  `duration` int NOT NULL COMMENT '课时长（分钟）',
  `session_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '一对一' COMMENT '上课类型：一对一/小班课/团体课',
  `session_status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '待确认' COMMENT '预约状态：待确认/已预约/上课中/已完成/已取消/缺席',
  `book_time` datetime NOT NULL COMMENT '预约时间',
  `confirm_time` datetime NULL DEFAULT NULL COMMENT '确认时间（管理员确认）',
  `start_time_actual` datetime NULL DEFAULT NULL COMMENT '实际上课开始时间',
  `end_time_actual` datetime NULL DEFAULT NULL COMMENT '实际下课时间',
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '备注信息',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`session_id`) USING BTREE,
  INDEX `fk_session_club`(`club_id` ASC) USING BTREE,
  INDEX `fk_session_table`(`table_id` ASC) USING BTREE,
  INDEX `fk_session_venue`(`venue_id` ASC) USING BTREE,
  INDEX `idx_course_id`(`course_id` ASC) USING BTREE,
  INDEX `idx_student_id`(`student_id` ASC) USING BTREE,
  INDEX `idx_coach_id`(`coach_id` ASC) USING BTREE,
  INDEX `idx_session_date`(`session_date` ASC) USING BTREE,
  INDEX `idx_session_status`(`session_status` ASC) USING BTREE,
  INDEX `idx_session_type`(`session_type` ASC) USING BTREE,
  INDEX `idx_book_time`(`book_time` ASC) USING BTREE,
  CONSTRAINT `fk_session_club` FOREIGN KEY (`club_id`) REFERENCES `club` (`club_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_session_coach` FOREIGN KEY (`coach_id`) REFERENCES `coach` (`coach_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_session_course` FOREIGN KEY (`course_id`) REFERENCES `course` (`course_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_session_student` FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_session_table` FOREIGN KEY (`table_id`) REFERENCES `pingpong_table` (`table_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_session_venue` FOREIGN KEY (`venue_id`) REFERENCES `venue` (`venue_id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '上课预约表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of course_session
-- ----------------------------

-- ----------------------------
-- Table structure for pingpong_table
-- ----------------------------
DROP TABLE IF EXISTS `pingpong_table`;
CREATE TABLE `pingpong_table`  (
  `table_id` int NOT NULL AUTO_INCREMENT COMMENT '球台id',
  `table_code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '球台编号',
  `table_brand` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '球台品牌',
  `table_status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '正常' COMMENT '球台状态',
  PRIMARY KEY (`table_id`) USING BTREE,
  UNIQUE INDEX `uk_table_code`(`table_code` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '球台信息表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of pingpong_table
-- ----------------------------

-- ----------------------------
-- Table structure for product
-- ----------------------------
DROP TABLE IF EXISTS `product`;
CREATE TABLE `product`  (
  `product_id` int NOT NULL AUTO_INCREMENT COMMENT '商品id',
  `product_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '商品名称',
  `product_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '商品编码',
  `category` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '商品分类',
  `brand` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '品牌',
  `price` decimal(10, 2) NOT NULL COMMENT '单价',
  `stock` int NOT NULL DEFAULT 0 COMMENT '库存数量',
  `product_status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '上架' COMMENT '商品状态',
  PRIMARY KEY (`product_id`) USING BTREE,
  UNIQUE INDEX `uk_product_code`(`product_code` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '商品信息表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of product
-- ----------------------------

-- ----------------------------
-- Table structure for product_order
-- ----------------------------
DROP TABLE IF EXISTS `product_order`;
CREATE TABLE `product_order`  (
  `order_id` int NOT NULL AUTO_INCREMENT COMMENT '订单ID（主键）',
  `order_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '订单编号（唯一业务编号）',
  `student_id` int NOT NULL COMMENT '学员ID，外键关联student表',
  `product_id` int NOT NULL COMMENT '商品ID，外键关联product表',
  `product_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '商品名称（下单时的名称）',
  `unit_price` decimal(10, 2) NOT NULL COMMENT '商品单价',
  `quantity` int NOT NULL DEFAULT 1 COMMENT '购买数量',
  `total_amount` decimal(10, 2) NOT NULL COMMENT '订单总金额',
  `payment_status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '待支付' COMMENT '支付状态：待支付/已支付/支付失败/已退款',
  `order_status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '待处理' COMMENT '订单状态：待处理/已确认/已发货/已完成/已取消',
  `payment_method` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '支付方式：微信/支付宝/现金/刷卡',
  `payment_time` datetime NULL DEFAULT NULL COMMENT '支付时间',
  `delivery_address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '收货地址',
  `receiver_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '收货人姓名',
  `receiver_phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '收货人电话',
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '订单备注',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`order_id`) USING BTREE,
  UNIQUE INDEX `uk_order_number`(`order_number` ASC) USING BTREE,
  INDEX `idx_student_id`(`student_id` ASC) USING BTREE,
  INDEX `idx_product_id`(`product_id` ASC) USING BTREE,
  INDEX `idx_payment_status`(`payment_status` ASC) USING BTREE,
  INDEX `idx_order_status`(`order_status` ASC) USING BTREE,
  INDEX `idx_create_time`(`create_time` ASC) USING BTREE,
  CONSTRAINT `fk_order_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_order_student` FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '商品购买表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of product_order
-- ----------------------------

-- ----------------------------
-- Table structure for student
-- ----------------------------
DROP TABLE IF EXISTS `student`;
CREATE TABLE `student`  (
  `student_id` int NOT NULL AUTO_INCREMENT COMMENT '学员id',
  `student_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '学员姓名',
  `student_age` int NULL DEFAULT NULL COMMENT '年龄',
  `student_gender` varchar(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '性别',
  `contact_info` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '联系方式',
  `level` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '水平等级',
  PRIMARY KEY (`student_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '学员信息表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of student
-- ----------------------------

-- ----------------------------
-- Table structure for venue
-- ----------------------------
DROP TABLE IF EXISTS `venue`;
CREATE TABLE `venue`  (
  `venue_id` int NOT NULL AUTO_INCREMENT COMMENT '场地id',
  `venue_code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '编号',
  `venue_status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '可用' COMMENT '场地状态',
  `total_tables` int NOT NULL DEFAULT 0 COMMENT '总球台数',
  `available_tables` int NOT NULL DEFAULT 0 COMMENT '空闲球台数',
  `in_use_tables` int NOT NULL DEFAULT 0 COMMENT '在用球台数',
  `venue_height` decimal(5, 2) NULL DEFAULT NULL COMMENT '场地高度',
  `venue_photo` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '场地照片',
  PRIMARY KEY (`venue_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '场地信息表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of venue
-- ----------------------------

-- ----------------------------
-- Triggers structure for table course_purchase
-- ----------------------------
DROP TRIGGER IF EXISTS `before_course_purchase_insert`;
delimiter ;;
CREATE TRIGGER `before_course_purchase_insert` BEFORE INSERT ON `course_purchase` FOR EACH ROW BEGIN
    SET NEW.remaining_count = NEW.course_count;
END
;;
delimiter ;

SET FOREIGN_KEY_CHECKS = 1;
