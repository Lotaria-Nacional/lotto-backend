/*
  Warnings:

  - You are about to drop the column `city_id` on the `Administration` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Administration" DROP CONSTRAINT "Administration_city_id_fkey";

-- AlterTable
ALTER TABLE "public"."Administration" DROP COLUMN "city_id";

-- AlterTable
ALTER TABLE "public"."City" ADD COLUMN     "administration_id" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."City" ADD CONSTRAINT "City_administration_id_fkey" FOREIGN KEY ("administration_id") REFERENCES "public"."Administration"("id") ON DELETE SET NULL ON UPDATE CASCADE;
