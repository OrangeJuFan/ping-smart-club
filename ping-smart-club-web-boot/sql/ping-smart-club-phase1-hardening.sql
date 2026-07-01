SET NAMES utf8mb4;

-- 第一阶段已初始化数据库的加固脚本：
-- 1. 会话从 JVM 内存迁移到数据库；
-- 2. 密码字段扩容，支持 PBKDF2 散列和历史明文自动迁移；
-- 3. 预约活跃态唯一键，防止并发重复预约/候补；
-- 4. 课时流水业务单号，防止重复消课。

CREATE TABLE IF NOT EXISTS `psc_auth_session` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '会话ID',
  `token_hash` varchar(96) NOT NULL COMMENT '访问令牌SHA-256摘要',
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `username` varchar(64) DEFAULT NULL COMMENT '登录账号快照',
  `display_name` varchar(64) DEFAULT NULL COMMENT '展示名快照',
  `role` varchar(32) NOT NULL COMMENT '角色快照',
  `related_id` bigint DEFAULT NULL COMMENT '关联业务ID快照',
  `status` varchar(16) NOT NULL DEFAULT 'ACTIVE' COMMENT 'ACTIVE/REVOKED/EXPIRED',
  `expire_at` datetime NOT NULL COMMENT '过期时间',
  `revoked_at` datetime DEFAULT NULL COMMENT '吊销时间',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_psc_auth_session_token_hash` (`token_hash`),
  KEY `idx_psc_auth_session_user_status` (`user_id`, `status`),
  KEY `idx_psc_auth_session_expire` (`expire_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='登录会话表';

ALTER TABLE `psc_user`
  MODIFY COLUMN `password` varchar(255) NOT NULL COMMENT '密码散列；兼容历史明文并在首次登录后自动迁移';

ALTER TABLE `psc_booking`
  ADD COLUMN `active_key` varchar(64) DEFAULT NULL COMMENT '活跃预约唯一键；终态置空' AFTER `student_id`;

UPDATE `psc_booking`
SET `active_key` = CONCAT(`schedule_id`, ':', `student_id`)
WHERE `status` IN ('BOOKED', 'WAITING')
  AND `active_key` IS NULL;

ALTER TABLE `psc_booking`
  ADD UNIQUE KEY `uk_psc_booking_active` (`active_key`);

ALTER TABLE `psc_lesson_account`
  ADD COLUMN `version` int NOT NULL DEFAULT 0 COMMENT '乐观锁版本，当前配合行锁预留' AFTER `total_consumed`;

ALTER TABLE `psc_lesson_transaction`
  ADD COLUMN `biz_no` varchar(96) DEFAULT NULL COMMENT '业务单号，保证扣课时等操作幂等' AFTER `id`;

UPDATE `psc_lesson_transaction`
SET `biz_no` = CONCAT('LEGACY:', `id`)
WHERE `biz_no` IS NULL;

ALTER TABLE `psc_lesson_transaction`
  MODIFY COLUMN `biz_no` varchar(96) NOT NULL COMMENT '业务单号，保证扣课时等操作幂等',
  ADD UNIQUE KEY `uk_psc_lesson_tx_biz_no` (`biz_no`);
