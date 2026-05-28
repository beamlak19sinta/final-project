/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `ServiceSector` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ServiceSector_name_key" ON "ServiceSector"("name");
