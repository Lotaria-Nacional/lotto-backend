/*
  Warnings:

  - Made the column `arrived_at` on table `terminals` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."terminals" ADD COLUMN     "leaved_at" TIMESTAMP(3),
ALTER COLUMN "arrived_at" SET NOT NULL;
