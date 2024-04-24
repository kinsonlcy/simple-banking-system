/*
  Warnings:

  - A unique constraint covering the columns `[name,ownerId]` on the table `BankAccount` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "BankAccount_name_ownerId_key" ON "BankAccount"("name", "ownerId");
