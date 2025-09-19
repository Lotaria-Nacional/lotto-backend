/*
  Warnings:

  - A unique constraint covering the columns `[number]` on the table `sim_cards` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `latitude` to the `licences` table without a default value. This is not possible if the table is not empty.
  - Added the required column `longitude` to the `licences` table without a default value. This is not possible if the table is not empty.
  - Made the column `coordinates` on table `licences` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `coordinates` to the `pos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."licences" ADD COLUMN     "latitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "longitude" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "coordinates" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."pos" ADD COLUMN     "coordinates" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "sim_cards_number_key" ON "public"."sim_cards"("number");
