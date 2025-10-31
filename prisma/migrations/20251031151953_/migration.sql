/*
  Warnings:

  - You are about to alter the column `transfer_value` on the `afrimoney` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `remarks` on the `afrimoney` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `sender_staff_reference` on the `koral_play` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `operation` on the `koral_play` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.

*/
-- AlterTable
ALTER TABLE "public"."afrimoney" ALTER COLUMN "transfer_value" SET DATA TYPE INTEGER,
ALTER COLUMN "remarks" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "public"."koral_play" ALTER COLUMN "sender_staff_reference" SET DATA TYPE INTEGER,
ALTER COLUMN "operation" SET DATA TYPE INTEGER;
