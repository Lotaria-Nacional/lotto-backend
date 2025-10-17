/*
  Warnings:

  - You are about to drop the column `transfer_date` on the `afrimoney_activities` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."afrimoney_activities" DROP COLUMN "transfer_date",
ADD COLUMN     "date" TEXT;
