-- CreateTable
CREATE TABLE `wallet` (
    `id` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `balance` DECIMAL(20, 4) NULL DEFAULT 0.0000,
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,

    INDEX `wallet_created_at`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transaction` (
    `id` VARCHAR(255) NOT NULL,
    `description` VARCHAR(255) NULL,
    `amount` DECIMAL(20, 4) NOT NULL,
    `closingBalance` DECIMAL(20, 4) NOT NULL,
    `created_at` DATETIME(0) NULL,
    `type` VARCHAR(255) NOT NULL,
    `wallet_id` VARCHAR(255) NOT NULL,

    INDEX `transaction_amount`(`amount`),
    INDEX `transaction_type`(`type`),
    INDEX `transaction_wallet_id`(`wallet_id`),
    INDEX `transaction_created_at`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transaction_type` (
    `id` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `priority` INTEGER UNSIGNED NOT NULL,
    `created_at` DATETIME(0) NULL,

    UNIQUE INDEX `name`(`name`),
    UNIQUE INDEX `priority`(`priority`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `job_record` (
    `id` VARCHAR(255) NOT NULL,
    `wallet_id` VARCHAR(255) NOT NULL,
    `resource_id` VARCHAR(255) NOT NULL,
    `status` ENUM('PUSHED', 'STARTED', 'SETTLED', 'ERRORED') NOT NULL,
    `worker_id` INTEGER UNSIGNED NOT NULL,
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,

    INDEX `job_record_created_at`(`created_at`),
    INDEX `job_record_status`(`status`),
    INDEX `job_record_wallet_id`(`wallet_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `transaction` ADD CONSTRAINT `transaction_ibfk_1` FOREIGN KEY (`type`) REFERENCES `transaction_type`(`name`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaction` ADD CONSTRAINT `transaction_ibfk_2` FOREIGN KEY (`wallet_id`) REFERENCES `wallet`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `job_record` ADD CONSTRAINT `job_record_ibfk_1` FOREIGN KEY (`wallet_id`) REFERENCES `wallet`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;
