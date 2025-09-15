/*
  Warnings:

  - You are about to drop the column `admin_id` on the `pos` table. All the data in the column will be lost.
  - You are about to drop the column `agent_id` on the `pos` table. All the data in the column will be lost.
  - You are about to drop the column `area_id` on the `pos` table. All the data in the column will be lost.
  - You are about to drop the column `city_id` on the `pos` table. All the data in the column will be lost.
  - You are about to drop the column `licence_id` on the `pos` table. All the data in the column will be lost.
  - You are about to drop the column `province_id` on the `pos` table. All the data in the column will be lost.
  - You are about to drop the column `subtype_id` on the `pos` table. All the data in the column will be lost.
  - You are about to drop the column `type_id` on the `pos` table. All the data in the column will be lost.
  - You are about to drop the column `zone_id` on the `pos` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `administrations` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[reference]` on the table `licences` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[agent_id_reference]` on the table `pos` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `subtypes` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `types` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `admin_name` to the `pos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `city_name` to the `pos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `province_name` to the `pos` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."pos" DROP CONSTRAINT "pos_admin_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."pos" DROP CONSTRAINT "pos_agent_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."pos" DROP CONSTRAINT "pos_area_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."pos" DROP CONSTRAINT "pos_city_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."pos" DROP CONSTRAINT "pos_licence_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."pos" DROP CONSTRAINT "pos_province_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."pos" DROP CONSTRAINT "pos_subtype_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."pos" DROP CONSTRAINT "pos_type_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."pos" DROP CONSTRAINT "pos_zone_id_fkey";

-- DropIndex
DROP INDEX "public"."pos_agent_id_key";

-- AlterTable
ALTER TABLE "public"."pos" DROP COLUMN "admin_id",
DROP COLUMN "agent_id",
DROP COLUMN "area_id",
DROP COLUMN "city_id",
DROP COLUMN "licence_id",
DROP COLUMN "province_id",
DROP COLUMN "subtype_id",
DROP COLUMN "type_id",
DROP COLUMN "zone_id",
ADD COLUMN     "admin_name" TEXT NOT NULL,
ADD COLUMN     "agent_id_reference" INTEGER,
ADD COLUMN     "area_name" TEXT,
ADD COLUMN     "city_name" TEXT NOT NULL,
ADD COLUMN     "licence_reference" TEXT,
ADD COLUMN     "province_name" TEXT NOT NULL,
ADD COLUMN     "subtype_name" TEXT,
ADD COLUMN     "type_name" TEXT,
ADD COLUMN     "zone_number" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "administrations_name_key" ON "public"."administrations"("name");

-- CreateIndex
CREATE UNIQUE INDEX "licences_reference_key" ON "public"."licences"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "pos_agent_id_reference_key" ON "public"."pos"("agent_id_reference");

-- CreateIndex
CREATE UNIQUE INDEX "subtypes_name_key" ON "public"."subtypes"("name");

-- CreateIndex
CREATE UNIQUE INDEX "types_name_key" ON "public"."types"("name");

-- AddForeignKey
ALTER TABLE "public"."pos" ADD CONSTRAINT "pos_admin_name_fkey" FOREIGN KEY ("admin_name") REFERENCES "public"."administrations"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pos" ADD CONSTRAINT "pos_licence_reference_fkey" FOREIGN KEY ("licence_reference") REFERENCES "public"."licences"("reference") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pos" ADD CONSTRAINT "pos_agent_id_reference_fkey" FOREIGN KEY ("agent_id_reference") REFERENCES "public"."agents"("id_reference") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pos" ADD CONSTRAINT "pos_area_name_fkey" FOREIGN KEY ("area_name") REFERENCES "public"."areas"("name") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pos" ADD CONSTRAINT "pos_zone_number_fkey" FOREIGN KEY ("zone_number") REFERENCES "public"."zones"("number") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pos" ADD CONSTRAINT "pos_city_name_fkey" FOREIGN KEY ("city_name") REFERENCES "public"."cities"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pos" ADD CONSTRAINT "pos_province_name_fkey" FOREIGN KEY ("province_name") REFERENCES "public"."provinces"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pos" ADD CONSTRAINT "pos_type_name_fkey" FOREIGN KEY ("type_name") REFERENCES "public"."types"("name") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pos" ADD CONSTRAINT "pos_subtype_name_fkey" FOREIGN KEY ("subtype_name") REFERENCES "public"."subtypes"("name") ON DELETE SET NULL ON UPDATE CASCADE;
