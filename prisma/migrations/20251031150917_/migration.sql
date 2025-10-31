/*
  Warnings:

  - You are about to drop the column `accountId` on the `afrimoney` table. All the data in the column will be lost.
  - You are about to drop the column `postBalance` on the `afrimoney` table. All the data in the column will be lost.
  - You are about to drop the column `previousBalance` on the `afrimoney` table. All the data in the column will be lost.
  - You are about to drop the column `secondPartyAccountId` on the `afrimoney` table. All the data in the column will be lost.
  - You are about to drop the column `serviceCharge` on the `afrimoney` table. All the data in the column will be lost.
  - You are about to drop the column `serviceType` on the `afrimoney` table. All the data in the column will be lost.
  - You are about to drop the column `transactionType` on the `afrimoney` table. All the data in the column will be lost.
  - You are about to drop the column `transferId` on the `afrimoney` table. All the data in the column will be lost.
  - You are about to drop the column `transferValue` on the `afrimoney` table. All the data in the column will be lost.
  - The `remarks` column on the `afrimoney` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `amountAfter` on the `koral_play` table. All the data in the column will be lost.
  - You are about to drop the column `operationDate` on the `koral_play` table. All the data in the column will be lost.
  - You are about to drop the column `paymentMode` on the `koral_play` table. All the data in the column will be lost.
  - You are about to drop the column `receiverAccountId` on the `koral_play` table. All the data in the column will be lost.
  - You are about to drop the column `receiverDetails` on the `koral_play` table. All the data in the column will be lost.
  - You are about to drop the column `receiverStaffReference` on the `koral_play` table. All the data in the column will be lost.
  - You are about to drop the column `senderAccountId` on the `koral_play` table. All the data in the column will be lost.
  - You are about to drop the column `senderDetails` on the `koral_play` table. All the data in the column will be lost.
  - You are about to drop the column `senderStaffReference` on the `koral_play` table. All the data in the column will be lost.
  - You are about to drop the column `signedBy` on the `koral_play` table. All the data in the column will be lost.
  - You are about to drop the column `signedByStaffReference` on the `koral_play` table. All the data in the column will be lost.
  - You are about to drop the column `transactionType` on the `koral_play` table. All the data in the column will be lost.
  - You are about to drop the column `transferId` on the `koral_play` table. All the data in the column will be lost.
  - The `date` column on the `koral_play` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `operation` column on the `koral_play` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."afrimoney" DROP COLUMN "accountId",
DROP COLUMN "postBalance",
DROP COLUMN "previousBalance",
DROP COLUMN "secondPartyAccountId",
DROP COLUMN "serviceCharge",
DROP COLUMN "serviceType",
DROP COLUMN "transactionType",
DROP COLUMN "transferId",
DROP COLUMN "transferValue",
ADD COLUMN     "account_id" TEXT,
ADD COLUMN     "post_balance" TEXT,
ADD COLUMN     "previous_balance" TEXT,
ADD COLUMN     "second_party_account_id" TEXT,
ADD COLUMN     "service_charge" TEXT,
ADD COLUMN     "service_type" TEXT,
ADD COLUMN     "transaction_type" TEXT,
ADD COLUMN     "transfer_id" TEXT,
ADD COLUMN     "transfer_value" BIGINT,
DROP COLUMN "remarks",
ADD COLUMN     "remarks" BIGINT;

-- AlterTable
ALTER TABLE "public"."koral_play" DROP COLUMN "amountAfter",
DROP COLUMN "operationDate",
DROP COLUMN "paymentMode",
DROP COLUMN "receiverAccountId",
DROP COLUMN "receiverDetails",
DROP COLUMN "receiverStaffReference",
DROP COLUMN "senderAccountId",
DROP COLUMN "senderDetails",
DROP COLUMN "senderStaffReference",
DROP COLUMN "signedBy",
DROP COLUMN "signedByStaffReference",
DROP COLUMN "transactionType",
DROP COLUMN "transferId",
ADD COLUMN     "amount_after" TEXT,
ADD COLUMN     "operation_date" TIMESTAMP(3),
ADD COLUMN     "payment_mode" TEXT,
ADD COLUMN     "receiver_account_id" TEXT,
ADD COLUMN     "receiver_details" TEXT,
ADD COLUMN     "receiver_staff_reference" TEXT,
ADD COLUMN     "sender_account_id" TEXT,
ADD COLUMN     "sender_details" TEXT,
ADD COLUMN     "sender_staff_reference" BIGINT,
ADD COLUMN     "signed_by" TEXT,
ADD COLUMN     "signed_by_staff_reference" TEXT,
ADD COLUMN     "transaction_type" TEXT,
ADD COLUMN     "transfer_id" TEXT,
DROP COLUMN "date",
ADD COLUMN     "date" TIMESTAMP(3),
DROP COLUMN "operation",
ADD COLUMN     "operation" BIGINT;
