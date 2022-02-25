/*
  Warnings:

  - A unique constraint covering the columns `[address]` on the table `Address` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Address_address_key` ON `Address`(`address`);
