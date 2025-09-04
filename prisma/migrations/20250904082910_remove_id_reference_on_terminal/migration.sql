/*
  Warnings:

  - You are about to drop the column `area_id` on the `terminals` table. All the data in the column will be lost.
  - You are about to drop the column `city_id` on the `terminals` table. All the data in the column will be lost.
  - You are about to drop the column `id_reference` on the `terminals` table. All the data in the column will be lost.
  - You are about to drop the column `province_id` on the `terminals` table. All the data in the column will be lost.
  - You are about to drop the column `zone_id` on the `terminals` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."terminals" DROP CONSTRAINT "terminals_area_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."terminals" DROP CONSTRAINT "terminals_city_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."terminals" DROP CONSTRAINT "terminals_province_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."terminals" DROP CONSTRAINT "terminals_zone_id_fkey";

-- DropIndex
DROP INDEX "public"."terminals_id_reference_key";

-- AlterTable
ALTER TABLE "public"."terminals" DROP COLUMN "area_id",
DROP COLUMN "city_id",
DROP COLUMN "id_reference",
DROP COLUMN "province_id",
DROP COLUMN "zone_id";
