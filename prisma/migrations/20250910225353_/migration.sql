/*
  Warnings:

  - You are about to drop the column `coordinates` on the `pos` table. All the data in the column will be lost.
  - Added the required column `latitude` to the `pos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `longitude` to the `pos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."pos" DROP COLUMN "coordinates",
ADD COLUMN     "latitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "longitude" DOUBLE PRECISION NOT NULL;
