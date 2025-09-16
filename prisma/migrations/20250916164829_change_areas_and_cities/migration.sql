/*
  Warnings:

  - You are about to drop the column `city_id` on the `Area` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Area" DROP CONSTRAINT "Area_city_id_fkey";

-- AlterTable
ALTER TABLE "public"."Area" DROP COLUMN "city_id";

-- CreateTable
CREATE TABLE "public"."_AreaCities" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_AreaCities_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_AreaCities_B_index" ON "public"."_AreaCities"("B");

-- AddForeignKey
ALTER TABLE "public"."_AreaCities" ADD CONSTRAINT "_AreaCities_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Area"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_AreaCities" ADD CONSTRAINT "_AreaCities_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."City"("id") ON DELETE CASCADE ON UPDATE CASCADE;
