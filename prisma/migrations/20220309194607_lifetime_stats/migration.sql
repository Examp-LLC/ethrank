-- AlterTable
ALTER TABLE `Address` ADD COLUMN `activeSince` DATETIME(3) NULL,
    ADD COLUMN `spentOnGas` INTEGER NULL,
    ADD COLUMN `transactions` INTEGER NULL;
