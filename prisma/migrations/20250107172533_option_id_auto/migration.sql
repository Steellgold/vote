/*
  Warnings:

  - A unique constraint covering the columns `[optionId]` on the table `Option` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Option_optionId_key" ON "Option"("optionId");
