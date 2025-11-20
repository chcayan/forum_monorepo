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

 Date: 20/11/2025 11:15:58
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
-- Table structure for comments
-- ----------------------------
DROP TABLE IF EXISTS `comments`;
CREATE TABLE `comments`  (
  `comment_id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `p_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `c_content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`comment_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 137 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

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
) ENGINE = InnoDB AUTO_INCREMENT = 1577 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

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
  PRIMARY KEY (`p_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

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
