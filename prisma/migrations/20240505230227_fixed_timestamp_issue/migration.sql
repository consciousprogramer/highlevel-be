-- DropForeignKey
ALTER TABLE `transaction` DROP FOREIGN KEY `transaction_type_fkey`;

-- DropForeignKey
ALTER TABLE `transaction` DROP FOREIGN KEY `transaction_wallet_id_fkey`;

-- AlterTable
ALTER TABLE `transaction` MODIFY `created_at` DATETIME(0) NULL;

-- AlterTable
ALTER TABLE `transaction_type` MODIFY `created_at` DATETIME(0) NULL;

-- AlterTable
ALTER TABLE `wallet` MODIFY `created_at` DATETIME(0) NULL,
    MODIFY `updated_at` DATETIME(0) NULL;

-- AddForeignKey
ALTER TABLE `transaction` ADD CONSTRAINT `transaction_ibfk_1` FOREIGN KEY (`type`) REFERENCES `transaction_type`(`name`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaction` ADD CONSTRAINT `transaction_ibfk_2` FOREIGN KEY (`wallet_id`) REFERENCES `wallet`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `transaction_type` RENAME INDEX `transaction_type_name_key` TO `name`;

-- RenameIndex
ALTER TABLE `transaction_type` RENAME INDEX `transaction_type_priority_key` TO `priority`;
