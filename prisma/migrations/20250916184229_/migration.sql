/*
  Warnings:

  - You are about to drop the `_AreaCities` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `zones` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[zone_id]` on the table `City` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."_AreaCities" DROP CONSTRAINT "_AreaCities_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_AreaCities" DROP CONSTRAINT "_AreaCities_B_fkey";

-- DropForeignKey
ALTER TABLE "public"."pos" DROP CONSTRAINT "pos_zone_number_fkey";

-- DropForeignKey
ALTER TABLE "public"."zones" DROP CONSTRAINT "zones_area_id_fkey";

-- AlterTable
ALTER TABLE "public"."City" ADD COLUMN     "area_id" INTEGER,
ADD COLUMN     "zone_id" INTEGER;

-- DropTable
DROP TABLE "public"."_AreaCities";

-- DropTable
DROP TABLE "public"."zones";

-- CreateTable
CREATE TABLE "public"."Zone" (
    "id" SERIAL NOT NULL,
    "number" INTEGER NOT NULL,

    CONSTRAINT "Zone_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Zone_number_key" ON "public"."Zone"("number");

-- CreateIndex
CREATE UNIQUE INDEX "City_zone_id_key" ON "public"."City"("zone_id");

-- AddForeignKey
ALTER TABLE "public"."pos" ADD CONSTRAINT "pos_zone_number_fkey" FOREIGN KEY ("zone_number") REFERENCES "public"."Zone"("number") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."City" ADD CONSTRAINT "City_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "public"."Zone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."City" ADD CONSTRAINT "City_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "public"."Area"("id") ON DELETE SET NULL ON UPDATE CASCADE;
