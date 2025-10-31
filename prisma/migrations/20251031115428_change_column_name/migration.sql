/*
  Warnings:

  - You are about to drop the column `ReceiverStaffReference` on the `koral_play` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."koral_play" DROP COLUMN "ReceiverStaffReference",
ADD COLUMN     "receiverStaffReference" BIGINT;
