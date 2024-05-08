-- CreateTable
CREATE TABLE `wallet` (
    `id` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `balance` DECIMAL(20, 4) NULL DEFAULT 0.0000,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,

    INDEX `wallet_name`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transaction` (
    `id` VARCHAR(255) NOT NULL,
    `description` VARCHAR(255) NULL,
    `amount` DECIMAL(20, 4) NOT NULL,
    `closingBalance` DECIMAL(20, 4) NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `type` VARCHAR(255) NOT NULL,
    `wallet_id` VARCHAR(255) NOT NULL,

    INDEX `transaction_amount`(`amount`),
    INDEX `transaction_type`(`type`),
    INDEX `transaction_wallet_id`(`wallet_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transaction_type` (
    `id` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `priority` INTEGER UNSIGNED NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `transaction_type_name_key`(`name`),
    UNIQUE INDEX `transaction_type_priority_key`(`priority`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `transaction` ADD CONSTRAINT `transaction_type_fkey` FOREIGN KEY (`type`) REFERENCES `transaction_type`(`name`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaction` ADD CONSTRAINT `transaction_wallet_id_fkey` FOREIGN KEY (`wallet_id`) REFERENCES `wallet`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;
