/*
  Warnings:

  - You are about to drop the `Administration` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Area` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `City` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Zone` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."City" DROP CONSTRAINT "City_administration_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."City" DROP CONSTRAINT "City_area_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."City" DROP CONSTRAINT "City_province_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."City" DROP CONSTRAINT "City_zone_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."licences" DROP CONSTRAINT "licences_admin_name_fkey";

-- DropForeignKey
ALTER TABLE "public"."pos" DROP CONSTRAINT "pos_admin_name_fkey";

-- DropForeignKey
ALTER TABLE "public"."pos" DROP CONSTRAINT "pos_area_name_fkey";

-- DropForeignKey
ALTER TABLE "public"."pos" DROP CONSTRAINT "pos_city_name_fkey";

-- DropForeignKey
ALTER TABLE "public"."pos" DROP CONSTRAINT "pos_zone_number_fkey";

-- DropTable
DROP TABLE "public"."Administration";

-- DropTable
DROP TABLE "public"."Area";

-- DropTable
DROP TABLE "public"."City";

-- DropTable
DROP TABLE "public"."Zone";

-- CreateTable
CREATE TABLE "public"."administrations" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "administrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cities" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "province_id" INTEGER NOT NULL,
    "zone_id" INTEGER,
    "area_id" INTEGER,
    "administration_id" INTEGER,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."zones" (
    "id" SERIAL NOT NULL,
    "number" INTEGER NOT NULL,

    CONSTRAINT "zones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."areas" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "areas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "administrations_name_key" ON "public"."administrations"("name");

-- CreateIndex
CREATE UNIQUE INDEX "cities_name_key" ON "public"."cities"("name");

-- CreateIndex
CREATE UNIQUE INDEX "zones_number_key" ON "public"."zones"("number");

-- CreateIndex
CREATE UNIQUE INDEX "areas_name_key" ON "public"."areas"("name");

-- AddForeignKey
ALTER TABLE "public"."pos" ADD CONSTRAINT "pos_admin_name_fkey" FOREIGN KEY ("admin_name") REFERENCES "public"."administrations"("name") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pos" ADD CONSTRAINT "pos_area_name_fkey" FOREIGN KEY ("area_name") REFERENCES "public"."areas"("name") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pos" ADD CONSTRAINT "pos_zone_number_fkey" FOREIGN KEY ("zone_number") REFERENCES "public"."zones"("number") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pos" ADD CONSTRAINT "pos_city_name_fkey" FOREIGN KEY ("city_name") REFERENCES "public"."cities"("name") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."licences" ADD CONSTRAINT "licences_admin_name_fkey" FOREIGN KEY ("admin_name") REFERENCES "public"."administrations"("name") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cities" ADD CONSTRAINT "cities_province_id_fkey" FOREIGN KEY ("province_id") REFERENCES "public"."provinces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cities" ADD CONSTRAINT "cities_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "public"."zones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cities" ADD CONSTRAINT "cities_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "public"."areas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cities" ADD CONSTRAINT "cities_administration_id_fkey" FOREIGN KEY ("administration_id") REFERENCES "public"."administrations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
