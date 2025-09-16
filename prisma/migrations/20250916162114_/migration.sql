/*
  Warnings:

  - You are about to drop the `areas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cities` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."cities" DROP CONSTRAINT "cities_province_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."pos" DROP CONSTRAINT "pos_area_name_fkey";

-- DropForeignKey
ALTER TABLE "public"."pos" DROP CONSTRAINT "pos_city_name_fkey";

-- DropForeignKey
ALTER TABLE "public"."zones" DROP CONSTRAINT "zones_area_id_fkey";

-- DropTable
DROP TABLE "public"."areas";

-- DropTable
DROP TABLE "public"."cities";

-- CreateTable
CREATE TABLE "public"."City" (
    "name" TEXT NOT NULL,
    "id" SERIAL NOT NULL,
    "province_id" INTEGER NOT NULL,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Area" (
    "name" TEXT NOT NULL,
    "id" SERIAL NOT NULL,
    "city_id" INTEGER NOT NULL,

    CONSTRAINT "Area_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "City_name_key" ON "public"."City"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Area_name_key" ON "public"."Area"("name");

-- AddForeignKey
ALTER TABLE "public"."pos" ADD CONSTRAINT "pos_area_name_fkey" FOREIGN KEY ("area_name") REFERENCES "public"."Area"("name") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pos" ADD CONSTRAINT "pos_city_name_fkey" FOREIGN KEY ("city_name") REFERENCES "public"."City"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."City" ADD CONSTRAINT "City_province_id_fkey" FOREIGN KEY ("province_id") REFERENCES "public"."provinces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Area" ADD CONSTRAINT "Area_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "public"."City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."zones" ADD CONSTRAINT "zones_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "public"."Area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
