/*
  Warnings:

  - A unique constraint covering the columns `[pos_id]` on the table `pos` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `pos_id` to the `pos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."pos" ADD COLUMN     "pos_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "pos_pos_id_key" ON "public"."pos"("pos_id");
