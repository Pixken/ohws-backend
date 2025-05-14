/*
  Warnings:

  - You are about to drop the `Account` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Cash` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CashCategory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_AccountToUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Cash` DROP FOREIGN KEY `Cash_accountId_fkey`;

-- DropForeignKey
ALTER TABLE `Cash` DROP FOREIGN KEY `Cash_categoryId_fkey`;

-- DropForeignKey
ALTER TABLE `Cash` DROP FOREIGN KEY `Cash_userId_fkey`;

-- DropForeignKey
ALTER TABLE `_AccountToUser` DROP FOREIGN KEY `_AccountToUser_A_fkey`;

-- DropForeignKey
ALTER TABLE `_AccountToUser` DROP FOREIGN KEY `_AccountToUser_B_fkey`;

-- DropTable
DROP TABLE `Account`;

-- DropTable
DROP TABLE `Cash`;

-- DropTable
DROP TABLE `CashCategory`;

-- DropTable
DROP TABLE `User`;

-- DropTable
DROP TABLE `_AccountToUser`;

-- CreateTable
CREATE TABLE `sys_user` (
    `id` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `salt` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `nickname` VARCHAR(191) NULL,
    `avatar` VARCHAR(191) NULL,
    `phone_number` VARCHAR(191) NULL,
    `enabled` BOOLEAN NULL DEFAULT true,
    `login_fail_count` INTEGER NULL DEFAULT 0,
    `last_login_time` DATETIME(3) NULL,
    `last_login_ip` VARCHAR(191) NULL,
    `last_login_device` VARCHAR(191) NULL,
    `create_time` DATETIME(3) NOT NULL,
    `update_time` DATETIME(3) NOT NULL,
    `create_by` VARCHAR(191) NULL,
    `update_by` VARCHAR(191) NULL,

    UNIQUE INDEX `sys_user_username_key`(`username`),
    UNIQUE INDEX `sys_user_email_key`(`email`),
    INDEX `idx_user_username`(`username`),
    INDEX `idx_user_email`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_user_security` (
    `user_id` VARCHAR(191) NOT NULL,
    `max_login_attempts` INTEGER NULL DEFAULT 5,
    `two_factor_auth_enabled` BOOLEAN NULL DEFAULT false,
    `last_password_change` DATETIME(3) NULL,

    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_login_history` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` VARCHAR(191) NOT NULL,
    `ip_address` VARCHAR(191) NOT NULL,
    `device_type` VARCHAR(191) NULL,
    `login_time` DATETIME(3) NOT NULL,
    `success` BOOLEAN NOT NULL,
    `fail_reason` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_role` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `enabled` BOOLEAN NULL DEFAULT true,
    `data_scope` VARCHAR(191) NULL DEFAULT 'SELF',
    `create_time` DATETIME(3) NOT NULL,
    `update_time` DATETIME(3) NOT NULL,
    `create_by` VARCHAR(191) NULL,
    `update_by` VARCHAR(191) NULL,

    UNIQUE INDEX `sys_role_name_key`(`name`),
    INDEX `idx_role_name`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_user_role` (
    `user_id` VARCHAR(191) NOT NULL,
    `role_id` VARCHAR(191) NOT NULL,
    `create_time` DATETIME(3) NOT NULL,
    `create_by` VARCHAR(191) NULL,

    PRIMARY KEY (`user_id`, `role_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_menu` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `path` VARCHAR(191) NOT NULL,
    `component` VARCHAR(191) NULL,
    `icon` VARCHAR(191) NULL,
    `sort` INTEGER NULL DEFAULT 0,
    `visible` BOOLEAN NULL DEFAULT true,
    `parent_id` VARCHAR(191) NULL,
    `create_time` DATETIME(3) NOT NULL,
    `update_time` DATETIME(3) NOT NULL,
    `create_by` VARCHAR(191) NULL,
    `update_by` VARCHAR(191) NULL,

    UNIQUE INDEX `sys_menu_path_key`(`path`),
    INDEX `idx_menu_path`(`path`),
    INDEX `idx_menu_parent`(`parent_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_role_menu` (
    `role_id` VARCHAR(191) NOT NULL,
    `menu_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`role_id`, `menu_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_permission` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `type` VARCHAR(191) NOT NULL,
    `group_name` VARCHAR(191) NULL,
    `status` BOOLEAN NULL DEFAULT true,
    `path` VARCHAR(191) NULL,
    `icon` VARCHAR(191) NULL,
    `parent_id` VARCHAR(191) NULL,
    `sort_order` INTEGER NULL DEFAULT 0,
    `create_time` DATETIME(3) NOT NULL,
    `update_time` DATETIME(3) NOT NULL,

    UNIQUE INDEX `sys_permission_code_key`(`code`),
    INDEX `idx_permission_code`(`code`),
    INDEX `idx_permission_type`(`type`),
    INDEX `idx_permission_parent`(`parent_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_role_permission` (
    `role_id` VARCHAR(191) NOT NULL,
    `permission_id` VARCHAR(191) NOT NULL,
    `create_time` DATETIME(3) NOT NULL,
    `create_by` VARCHAR(191) NULL,

    PRIMARY KEY (`role_id`, `permission_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `domain_event` (
    `id` VARCHAR(191) NOT NULL,
    `topic` VARCHAR(191) NOT NULL,
    `event_type` VARCHAR(191) NOT NULL,
    `event_data` TEXT NOT NULL,
    `timestamp` DATETIME(3) NOT NULL,
    `processed` BOOLEAN NULL DEFAULT false,
    `process_time` DATETIME(3) NULL,

    INDEX `idx_event_topic`(`topic`),
    INDEX `idx_event_timestamp`(`timestamp`),
    INDEX `idx_event_processed`(`processed`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `accounts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `balance` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `icon` VARCHAR(191) NULL,
    `color` VARCHAR(191) NULL,
    `is_default` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `alert_threshold` DECIMAL(19, 2) NULL,

    INDEX `user_id`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categories` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` ENUM('expense', 'income', 'transfer') NOT NULL,
    `icon` VARCHAR(191) NULL,
    `color` VARCHAR(191) NULL,
    `parent_id` VARCHAR(191) NULL,
    `user_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `categories_parent_id_idx`(`parent_id`),
    INDEX `categories_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transactions` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `account_id` INTEGER NOT NULL,
    `category_id` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `type` ENUM('expense', 'income', 'transfer') NOT NULL,
    `description` VARCHAR(255) NULL,
    `transaction_date` DATETIME(3) NOT NULL,
    `transaction_time` TIME NULL,
    `location` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `transactions_user_id_idx`(`user_id`),
    INDEX `transactions_account_id_idx`(`account_id`),
    INDEX `transactions_category_id_idx`(`category_id`),
    INDEX `transactions_transaction_date_idx`(`transaction_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tags` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `color` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `tags_user_id_name_key`(`user_id`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transaction_tags` (
    `transaction_id` VARCHAR(191) NOT NULL,
    `tag_id` INTEGER NOT NULL,

    PRIMARY KEY (`transaction_id`, `tag_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `budgets` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` VARCHAR(191) NOT NULL,
    `category_id` VARCHAR(191) NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `period` ENUM('daily', 'weekly', 'monthly', 'yearly') NOT NULL DEFAULT 'monthly',
    `start_date` DATE NOT NULL,
    `end_date` DATE NULL,
    `notification_threshold` INTEGER NULL DEFAULT 80,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `budgets_user_id_idx`(`user_id`),
    INDEX `budgets_category_id_idx`(`category_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_settings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` VARCHAR(191) NOT NULL,
    `currency` VARCHAR(10) NOT NULL DEFAULT 'CNY',
    `theme` VARCHAR(20) NOT NULL DEFAULT 'system',
    `default_account_id` INTEGER NULL,
    `budget_notification` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `user_settings_user_id_key`(`user_id`),
    INDEX `user_settings_default_account_id_idx`(`default_account_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `budget_alert` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `account_id` INTEGER NOT NULL,
    `message` TEXT NOT NULL,
    `threshold` DECIMAL(19, 2) NOT NULL,
    `current_balance` DECIMAL(19, 2) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_user_id`(`user_id`),
    INDEX `idx_status`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `sys_user_security` ADD CONSTRAINT `sys_user_security_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `sys_user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sys_login_history` ADD CONSTRAINT `sys_login_history_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `sys_user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sys_user_role` ADD CONSTRAINT `sys_user_role_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `sys_user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sys_user_role` ADD CONSTRAINT `sys_user_role_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `sys_role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sys_role_menu` ADD CONSTRAINT `sys_role_menu_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `sys_role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sys_role_menu` ADD CONSTRAINT `sys_role_menu_menu_id_fkey` FOREIGN KEY (`menu_id`) REFERENCES `sys_menu`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sys_role_permission` ADD CONSTRAINT `sys_role_permission_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `sys_role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sys_role_permission` ADD CONSTRAINT `sys_role_permission_permission_id_fkey` FOREIGN KEY (`permission_id`) REFERENCES `sys_permission`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accounts` ADD CONSTRAINT `accounts_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `sys_user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `categories` ADD CONSTRAINT `categories_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `categories` ADD CONSTRAINT `categories_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `sys_user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `sys_user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_account_id_fkey` FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tags` ADD CONSTRAINT `tags_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `sys_user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaction_tags` ADD CONSTRAINT `transaction_tags_transaction_id_fkey` FOREIGN KEY (`transaction_id`) REFERENCES `transactions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaction_tags` ADD CONSTRAINT `transaction_tags_tag_id_fkey` FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `budgets` ADD CONSTRAINT `budgets_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `sys_user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `budgets` ADD CONSTRAINT `budgets_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_settings` ADD CONSTRAINT `user_settings_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `sys_user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_settings` ADD CONSTRAINT `user_settings_default_account_id_fkey` FOREIGN KEY (`default_account_id`) REFERENCES `accounts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `budget_alert` ADD CONSTRAINT `budget_alert_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `sys_user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `budget_alert` ADD CONSTRAINT `budget_alert_account_id_fkey` FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
