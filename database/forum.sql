/*
 Navicat Premium Dump SQL

 Source Server         : forum
 Source Server Type    : MySQL
 Source Server Version : 80043 (8.0.43)
 Source Host           : localhost:3306
 Source Schema         : forum

 Target Server Type    : MySQL
 Target Server Version : 80043 (8.0.43)
 File Encoding         : 65001

 Date: 13/03/2026 22:02:23
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for collection
-- ----------------------------
DROP TABLE IF EXISTS `collection`;
CREATE TABLE `collection`  (
  `user_id` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `p_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `collect_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`, `p_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for comment_report
-- ----------------------------
DROP TABLE IF EXISTS `comment_report`;
CREATE TABLE `comment_report`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `comment_id` int NOT NULL,
  `report_reason` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_comment_report`(`comment_id` ASC) USING BTREE,
  CONSTRAINT `fk_comment_report` FOREIGN KEY (`comment_id`) REFERENCES `comments` (`comment_id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 10 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for comments
-- ----------------------------
DROP TABLE IF EXISTS `comments`;
CREATE TABLE `comments`  (
  `comment_id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `p_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `c_content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `is_violation` int NOT NULL DEFAULT 0,
  PRIMARY KEY (`comment_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 173 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for follows
-- ----------------------------
DROP TABLE IF EXISTS `follows`;
CREATE TABLE `follows`  (
  `user_id` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `follow_id` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `follow_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`, `follow_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for messages
-- ----------------------------
DROP TABLE IF EXISTS `messages`;
CREATE TABLE `messages`  (
  `msg_id` int NOT NULL AUTO_INCREMENT,
  `sender` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `receiver` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `is_read` tinyint(1) NULL DEFAULT 0,
  `is_share` varchar(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT '0',
  PRIMARY KEY (`msg_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1642 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for permission
-- ----------------------------
DROP TABLE IF EXISTS `permission`;
CREATE TABLE `permission`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '权限编码',
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '权限名称',
  `scope` enum('user','admin') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '权限作用域',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `code`(`code` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 7 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for post
-- ----------------------------
DROP TABLE IF EXISTS `post`;
CREATE TABLE `post`  (
  `p_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `p_view_count` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '0',
  `p_collect_count` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '0',
  `p_share_count` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '0',
  `p_comment_count` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '0',
  `p_content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `p_images` json NULL,
  `publish_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `is_public` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'true',
  `status` tinyint NOT NULL DEFAULT 0 COMMENT '未审核: 0; 审核通过: 1; 审核未通过: 2',
  PRIMARY KEY (`p_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for post_report
-- ----------------------------
DROP TABLE IF EXISTS `post_report`;
CREATE TABLE `post_report`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `p_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `report_reason` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_post_report`(`p_id` ASC) USING BTREE,
  CONSTRAINT `fk_post_report` FOREIGN KEY (`p_id`) REFERENCES `post` (`p_id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 28 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for review_violation_reason
-- ----------------------------
DROP TABLE IF EXISTS `review_violation_reason`;
CREATE TABLE `review_violation_reason`  (
  `p_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `reason` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`p_id`) USING BTREE,
  CONSTRAINT `fk_violation_post` FOREIGN KEY (`p_id`) REFERENCES `post` (`p_id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for user_log
-- ----------------------------
DROP TABLE IF EXISTS `user_log`;
CREATE TABLE `user_log`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '日志ID',
  `user_id` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '被记录用户ID',
  `operator_id` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '操作人ID（管理员）',
  `post_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '关联帖子ID',
  `content` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '日志描述内容',
  `status` enum('post_review_pass','post_review_violate','user_mute','user_post_prohibit','user_login_prohibit','system_announcement','post_violate','comment_violate') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '日志状态类型',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `punish_time` bigint NULL DEFAULT 0,
  `comment_id` int NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_user_id`(`user_id` ASC) USING BTREE,
  INDEX `idx_status`(`status` ASC) USING BTREE,
  INDEX `idx_post_id`(`post_id` ASC) USING BTREE,
  INDEX `idx_comment_id`(`comment_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 57 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '用户行为及处罚日志表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for user_permission
-- ----------------------------
DROP TABLE IF EXISTS `user_permission`;
CREATE TABLE `user_permission`  (
  `user_id` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`user_id`, `permission_id`) USING BTREE,
  INDEX `fk_user_permission_permission`(`permission_id` ASC) USING BTREE,
  CONSTRAINT `fk_user_permission_permission` FOREIGN KEY (`permission_id`) REFERENCES `permission` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_user_permission_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `user_id` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_avatar` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT '/uploads/default/default_avatar.jpg',
  `user_email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `registration_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `follows` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT '0',
  `fans` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT '0',
  `sex` varchar(4) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'boy',
  `signature` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT '个性签名',
  `background_img` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT '/uploads/default/default_bg.jpg',
  `user_perm_mask` int NOT NULL DEFAULT 7 COMMENT '普通用户权限位缓存',
  `admin_perm_mask` int NOT NULL DEFAULT 0 COMMENT '管理员权限位缓存',
  `perm_version` int NOT NULL DEFAULT 1 COMMENT '权限版本号',
  `mute_until` datetime NULL DEFAULT NULL COMMENT '禁言截止时间',
  `post_prohibit_until` datetime NULL DEFAULT NULL COMMENT '禁止发帖截止时间',
  `login_prohibit_until` datetime NULL DEFAULT NULL COMMENT '禁止登录截止时间',
  PRIMARY KEY (`user_id`) USING BTREE,
  UNIQUE INDEX `user_email`(`user_email` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Triggers structure for table collection
-- ----------------------------
DROP TRIGGER IF EXISTS `update_collect_count`;
delimiter ;;
CREATE TRIGGER `update_collect_count` AFTER INSERT ON `collection` FOR EACH ROW BEGIN
  -- 递增对应帖子的收藏数
  UPDATE post 
  SET p_collect_count = p_collect_count + 1 
  WHERE p_id = NEW.p_id;
END
;;
delimiter ;

-- ----------------------------
-- Triggers structure for table collection
-- ----------------------------
DROP TRIGGER IF EXISTS `update_collect_count_del`;
delimiter ;;
CREATE TRIGGER `update_collect_count_del` AFTER DELETE ON `collection` FOR EACH ROW BEGIN
  if exists (select 1 from post where p_id = old.p_id) then
    UPDATE post 
    SET p_collect_count = p_collect_count - 1 
    WHERE p_id = OLD.p_id;
  end if;
END
;;
delimiter ;

-- ----------------------------
-- Triggers structure for table comments
-- ----------------------------
DROP TRIGGER IF EXISTS `update_post`;
delimiter ;;
CREATE TRIGGER `update_post` AFTER INSERT ON `comments` FOR EACH ROW begin
  update post set p_comment_count = p_comment_count + 1 WHERE p_id = new.p_id;
end
;;
delimiter ;

-- ----------------------------
-- Triggers structure for table follows
-- ----------------------------
DROP TRIGGER IF EXISTS `add_follow`;
delimiter ;;
CREATE TRIGGER `add_follow` AFTER INSERT ON `follows` FOR EACH ROW BEGIN
    UPDATE users
    SET follows = follows + 1 
    WHERE user_id = new.user_id;
END
;;
delimiter ;

-- ----------------------------
-- Triggers structure for table follows
-- ----------------------------
DROP TRIGGER IF EXISTS `increase_fans`;
delimiter ;;
CREATE TRIGGER `increase_fans` AFTER INSERT ON `follows` FOR EACH ROW BEGIN
    UPDATE users
    SET fans = fans + 1 
    WHERE user_id = new.follow_id;
END
;;
delimiter ;

-- ----------------------------
-- Triggers structure for table follows
-- ----------------------------
DROP TRIGGER IF EXISTS `del_follow`;
delimiter ;;
CREATE TRIGGER `del_follow` AFTER DELETE ON `follows` FOR EACH ROW BEGIN
    UPDATE users
    SET follows = follows - 1 
    WHERE user_id = old.user_id;
END
;;
delimiter ;

-- ----------------------------
-- Triggers structure for table follows
-- ----------------------------
DROP TRIGGER IF EXISTS `decrease_fans`;
delimiter ;;
CREATE TRIGGER `decrease_fans` AFTER DELETE ON `follows` FOR EACH ROW BEGIN
    UPDATE users
    SET fans = fans - 1 
    WHERE user_id = old.follow_id;
END
;;
delimiter ;

-- ----------------------------
-- Triggers structure for table messages
-- ----------------------------
DROP TRIGGER IF EXISTS `trigger_add_share_count`;
delimiter ;;
CREATE TRIGGER `trigger_add_share_count` AFTER INSERT ON `messages` FOR EACH ROW BEGIN
    -- 逻辑判断：只有当新插入的这条消息 is_share = 1 时，才执行更新
    IF NEW.is_share = 1 THEN
        UPDATE post
        SET p_share_count = p_share_count + 1
        -- 关键点：通过 messages 表里的 post_id 找到 post 表里对应的记录
        WHERE p_id = NEW.content;
    END IF;
END
;;
delimiter ;

-- ----------------------------
-- Triggers structure for table post
-- ----------------------------
DROP TRIGGER IF EXISTS `delete_post`;
delimiter ;;
CREATE TRIGGER `delete_post` AFTER DELETE ON `post` FOR EACH ROW BEGIN
  DELETE FROM comments WHERE p_id = OLD.p_id;
  DELETE FROM collection WHERE p_id = OLD.p_id;
END
;;
delimiter ;

SET FOREIGN_KEY_CHECKS = 1;
