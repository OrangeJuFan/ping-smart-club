SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS `psc_user` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `username` varchar(64) DEFAULT NULL COMMENT '登录账号',
  `phone` varchar(20) DEFAULT NULL COMMENT '手机号',
  `password` varchar(128) NOT NULL COMMENT '密码，第一阶段明文，生产需替换为加密散列',
  `role` varchar(32) NOT NULL COMMENT 'ADMIN/COACH/STUDENT_PARENT',
  `related_id` bigint DEFAULT NULL COMMENT '关联教练ID或学员ID',
  `display_name` varchar(64) DEFAULT NULL COMMENT '展示名',
  `status` varchar(16) NOT NULL DEFAULT 'ACTIVE' COMMENT 'ACTIVE/DISABLED',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_psc_user_username` (`username`),
  KEY `idx_psc_user_phone_role` (`phone`, `role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='登录用户表';

CREATE TABLE IF NOT EXISTS `psc_student` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '学员ID',
  `name` varchar(64) NOT NULL COMMENT '姓名',
  `gender` varchar(16) DEFAULT NULL COMMENT '性别',
  `age` int DEFAULT NULL COMMENT '年龄',
  `phone` varchar(20) DEFAULT NULL COMMENT '手机号',
  `level` varchar(64) DEFAULT NULL COMMENT '乒乓球水平',
  `remark` varchar(500) DEFAULT NULL COMMENT '备注',
  `parent_name` varchar(64) DEFAULT NULL COMMENT '家长姓名',
  `parent_phone` varchar(20) DEFAULT NULL COMMENT '家长手机号',
  `status` varchar(16) NOT NULL DEFAULT 'ACTIVE' COMMENT 'ACTIVE/DISABLED',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_psc_student_phone` (`phone`),
  KEY `idx_psc_student_parent_phone` (`parent_phone`),
  KEY `idx_psc_student_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='学员档案表';

CREATE TABLE IF NOT EXISTS `psc_coach` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '教练ID',
  `name` varchar(64) NOT NULL COMMENT '姓名',
  `phone` varchar(20) DEFAULT NULL COMMENT '手机号',
  `qualification` varchar(255) DEFAULT NULL COMMENT '资质',
  `course_types` varchar(255) DEFAULT NULL COMMENT '可授课程类型，逗号分隔',
  `levels` varchar(255) DEFAULT NULL COMMENT '可授等级，逗号分隔',
  `profile` varchar(1000) DEFAULT NULL COMMENT '简介',
  `status` varchar(16) NOT NULL DEFAULT 'ACTIVE' COMMENT 'ACTIVE/DISABLED',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_psc_coach_phone` (`phone`),
  KEY `idx_psc_coach_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='教练档案表';

CREATE TABLE IF NOT EXISTS `psc_coach_availability` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `coach_id` bigint NOT NULL COMMENT '教练ID',
  `week_day` int NOT NULL COMMENT '星期几：1-7',
  `start_time` varchar(8) NOT NULL COMMENT '开始时间 HH:mm',
  `end_time` varchar(8) NOT NULL COMMENT '结束时间 HH:mm',
  `status` varchar(16) NOT NULL DEFAULT 'ACTIVE',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_psc_coach_availability_coach` (`coach_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='教练可授课时间表';

CREATE TABLE IF NOT EXISTS `psc_coach_leave` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `coach_id` bigint NOT NULL COMMENT '教练ID',
  `start_time` datetime NOT NULL COMMENT '请假开始时间',
  `end_time` datetime NOT NULL COMMENT '请假结束时间',
  `reason` varchar(500) DEFAULT NULL COMMENT '请假原因',
  `status` varchar(16) NOT NULL DEFAULT 'APPROVED' COMMENT 'PENDING/APPROVED/REJECTED/CANCELLED',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_psc_coach_leave_coach_time` (`coach_id`, `start_time`, `end_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='教练请假记录表';

CREATE TABLE IF NOT EXISTS `psc_course_type` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(64) NOT NULL COMMENT '课程类型：1对1/1对2/体验课/大班课',
  `description` varchar(500) DEFAULT NULL,
  `status` varchar(16) NOT NULL DEFAULT 'ACTIVE',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_psc_course_type_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='课程类型表';

CREATE TABLE IF NOT EXISTS `psc_course_product` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(128) NOT NULL COMMENT '课程产品名称',
  `course_type_id` bigint NOT NULL COMMENT '课程类型ID',
  `lesson_count` int NOT NULL COMMENT '课时数',
  `price` decimal(10,2) DEFAULT NULL COMMENT '价格',
  `bookable_capacity` int NOT NULL COMMENT '可约人数',
  `status` varchar(16) NOT NULL DEFAULT 'ACTIVE',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_psc_course_product_type` (`course_type_id`),
  KEY `idx_psc_course_product_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='课程产品表';

CREATE TABLE IF NOT EXISTS `psc_venue` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(64) NOT NULL COMMENT '场地名称',
  `location` varchar(255) DEFAULT NULL COMMENT '位置',
  `status` varchar(16) NOT NULL DEFAULT 'AVAILABLE' COMMENT 'AVAILABLE/DISABLED/MAINTENANCE',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_psc_venue_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='场地表';

CREATE TABLE IF NOT EXISTS `psc_course_schedule` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `course_product_id` bigint NOT NULL COMMENT '课程产品ID',
  `course_product_name` varchar(128) DEFAULT NULL COMMENT '课程产品名称快照',
  `coach_id` bigint NOT NULL COMMENT '教练ID',
  `coach_name` varchar(64) DEFAULT NULL COMMENT '教练名称快照',
  `venue_id` bigint NOT NULL COMMENT '场地ID',
  `venue_name` varchar(64) DEFAULT NULL COMMENT '场地名称快照',
  `start_time` datetime NOT NULL COMMENT '开始时间',
  `end_time` datetime NOT NULL COMMENT '结束时间',
  `capacity` int NOT NULL COMMENT '容量',
  `status` varchar(16) NOT NULL DEFAULT 'SCHEDULED' COMMENT 'SCHEDULED/CANCELLED/FINISHED',
  `remark` varchar(500) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_psc_schedule_coach_time` (`coach_id`, `start_time`, `end_time`),
  KEY `idx_psc_schedule_venue_time` (`venue_id`, `start_time`, `end_time`),
  KEY `idx_psc_schedule_status_time` (`status`, `start_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='课程安排/课表表';

CREATE TABLE IF NOT EXISTS `psc_booking` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `schedule_id` bigint NOT NULL COMMENT '课程安排ID',
  `student_id` bigint NOT NULL COMMENT '学员ID',
  `status` varchar(16) NOT NULL DEFAULT 'BOOKED' COMMENT 'BOOKED/CANCELLED/COMPLETED/ABSENT/WAITING',
  `source` varchar(16) DEFAULT NULL COMMENT 'STUDENT/ADMIN/COACH',
  `cancel_reason` varchar(500) DEFAULT NULL,
  `remark` varchar(500) DEFAULT NULL,
  `booked_at` datetime DEFAULT NULL,
  `canceled_at` datetime DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_psc_booking_schedule_status` (`schedule_id`, `status`),
  KEY `idx_psc_booking_student_status` (`student_id`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='预约记录表';

CREATE TABLE IF NOT EXISTS `psc_waitlist_entry` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `schedule_id` bigint NOT NULL COMMENT '课程安排ID',
  `student_id` bigint NOT NULL COMMENT '学员ID',
  `queue_no` int NOT NULL COMMENT '候补队列序号',
  `status` varchar(16) NOT NULL DEFAULT 'WAITING' COMMENT 'WAITING/PROMOTED/CANCELLED',
  `joined_at` datetime DEFAULT NULL,
  `promoted_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_psc_waitlist_schedule_status_queue` (`schedule_id`, `status`, `queue_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='候补队列表';

CREATE TABLE IF NOT EXISTS `psc_lesson_account` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `student_id` bigint NOT NULL COMMENT '学员ID',
  `balance` int NOT NULL DEFAULT 0 COMMENT '课时余额',
  `total_purchased` int NOT NULL DEFAULT 0 COMMENT '累计购买课时',
  `total_consumed` int NOT NULL DEFAULT 0 COMMENT '累计消耗课时',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_psc_lesson_account_student` (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='学员课时账户表';

CREATE TABLE IF NOT EXISTS `psc_lesson_transaction` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `student_id` bigint NOT NULL COMMENT '学员ID',
  `booking_id` bigint DEFAULT NULL COMMENT '预约ID',
  `transaction_type` varchar(16) NOT NULL COMMENT 'PURCHASE/CONSUME/REFUND/ADJUST',
  `change_hours` int NOT NULL COMMENT '变动课时，增加为正，扣减为负',
  `balance_after` int NOT NULL COMMENT '变动后余额',
  `operator_role` varchar(32) DEFAULT NULL COMMENT '操作人角色',
  `operator_id` bigint DEFAULT NULL COMMENT '操作人ID',
  `remark` varchar(500) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_psc_lesson_tx_student` (`student_id`, `created_at`),
  KEY `idx_psc_lesson_tx_booking` (`booking_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='课时流水表';

CREATE TABLE IF NOT EXISTS `psc_attendance_record` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `schedule_id` bigint NOT NULL COMMENT '课程安排ID',
  `booking_id` bigint DEFAULT NULL COMMENT '预约ID',
  `person_type` varchar(16) NOT NULL COMMENT 'COACH/STUDENT',
  `person_id` bigint NOT NULL COMMENT '人员ID',
  `status` varchar(16) NOT NULL DEFAULT 'PENDING' COMMENT 'PENDING/SIGNED_IN/ATTENDED/ABSENT/LEAVE',
  `check_in_method` varchar(32) DEFAULT NULL COMMENT '签到方式',
  `check_in_location` varchar(255) DEFAULT NULL COMMENT '签到位置',
  `device_info` varchar(255) DEFAULT NULL COMMENT '设备信息',
  `face_check_result` varchar(64) DEFAULT NULL COMMENT '人脸校验结果',
  `check_in_time` datetime DEFAULT NULL COMMENT '签到时间',
  `confirmed_at` datetime DEFAULT NULL COMMENT '后台确认时间',
  `remark` varchar(500) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_psc_attendance_schedule_person` (`schedule_id`, `person_type`, `person_id`),
  KEY `idx_psc_attendance_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='考勤记录表';

CREATE TABLE IF NOT EXISTS `psc_notification_record` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `notification_type` varchar(32) NOT NULL COMMENT 'BOOKING_SUCCESS/CANCEL/COURSE_CHANGED/REMINDER',
  `receiver_type` varchar(16) NOT NULL COMMENT 'STUDENT/COACH/ADMIN/ALL',
  `receiver_id` bigint DEFAULT NULL COMMENT '接收人ID',
  `title` varchar(128) NOT NULL COMMENT '标题',
  `content` varchar(1000) DEFAULT NULL COMMENT '内容',
  `channel` varchar(16) NOT NULL DEFAULT 'IN_APP' COMMENT 'IN_APP/WECHAT/SMS',
  `status` varchar(16) NOT NULL DEFAULT 'PENDING' COMMENT 'PENDING/SENT/FAILED/READ',
  `scheduled_at` datetime DEFAULT NULL COMMENT '计划发送时间',
  `sent_at` datetime DEFAULT NULL COMMENT '实际发送时间',
  `fail_reason` varchar(500) DEFAULT NULL COMMENT '失败原因',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_psc_notification_receiver` (`receiver_type`, `receiver_id`, `status`),
  KEY `idx_psc_notification_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知任务/消息记录表';

INSERT IGNORE INTO `psc_course_type` (`id`, `name`, `description`, `status`) VALUES
(1, '1对1', '一名教练一名学员', 'ACTIVE'),
(2, '1对2', '一名教练两名学员', 'ACTIVE'),
(3, '体验课', '新学员体验课程', 'ACTIVE'),
(4, '大班课', '多人课程，第一阶段由课程安排承载', 'ACTIVE');

INSERT IGNORE INTO `psc_user` (`id`, `username`, `phone`, `password`, `role`, `related_id`, `display_name`, `status`) VALUES
(1, 'admin', '13800000000', 'admin123', 'ADMIN', NULL, '系统管理员', 'ACTIVE'),
(2, 'coach_demo', '13800000001', '123456', 'COACH', NULL, '演示教练', 'ACTIVE'),
(3, 'student_demo', '13800000002', '123456', 'STUDENT_PARENT', NULL, '演示学员/家长', 'ACTIVE');

SET FOREIGN_KEY_CHECKS = 1;
