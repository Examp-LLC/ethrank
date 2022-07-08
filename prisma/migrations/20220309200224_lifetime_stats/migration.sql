/*
  Warnings:

  - You are about to alter the column `spentOnGas` on the `Address` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Decimal(65,30)`.

*/
-- AlterTable
ALTER TABLE `Address` MODIFY `spentOnGas` DECIMAL(65, 30) NULL;
