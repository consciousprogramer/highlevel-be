-- DropIndex
DROP INDEX `wallet_name` ON `wallet`;

-- CreateIndex
CREATE INDEX `transaction_created_at` ON `transaction`(`created_at`);

-- CreateIndex
CREATE INDEX `wallet_created_at` ON `wallet`(`created_at`);
