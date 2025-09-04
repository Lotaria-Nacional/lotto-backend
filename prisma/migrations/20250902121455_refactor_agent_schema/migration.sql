/*
  Warnings:

  - You are about to drop the column `area_id` on the `agents` table. All the data in the column will be lost.
  - You are about to drop the column `city_id` on the `agents` table. All the data in the column will be lost.
  - You are about to drop the column `province_id` on the `agents` table. All the data in the column will be lost.
  - You are about to drop the column `subtype_id` on the `agents` table. All the data in the column will be lost.
  - You are about to drop the column `type_id` on the `agents` table. All the data in the column will be lost.
  - You are about to drop the column `zone_id` on the `agents` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."agents" DROP CONSTRAINT "agents_area_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."agents" DROP CONSTRAINT "agents_city_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."agents" DROP CONSTRAINT "agents_province_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."agents" DROP CONSTRAINT "agents_subtype_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."agents" DROP CONSTRAINT "agents_type_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."agents" DROP CONSTRAINT "agents_zone_id_fkey";

-- AlterTable
ALTER TABLE "public"."agents" DROP COLUMN "area_id",
DROP COLUMN "city_id",
DROP COLUMN "province_id",
DROP COLUMN "subtype_id",
DROP COLUMN "type_id",
DROP COLUMN "zone_id";
