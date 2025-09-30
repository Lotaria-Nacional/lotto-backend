/*
  Warnings:

  - You are about to drop the column `slug` on the `Area` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `Zone` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."Area_slug_key";

-- DropIndex
DROP INDEX "public"."Zone_slug_key";

-- AlterTable
ALTER TABLE "public"."Area" DROP COLUMN "slug";

-- AlterTable
ALTER TABLE "public"."Zone" DROP COLUMN "slug";
