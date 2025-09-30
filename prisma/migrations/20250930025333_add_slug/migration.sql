/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Administration` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `Area` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `City` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `Zone` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `provinces` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `subtypes` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `types` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Administration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Area` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `City` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Zone` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `provinces` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `subtypes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `types` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Administration" ADD COLUMN     "slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Area" ADD COLUMN     "slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."City" ADD COLUMN     "slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Zone" ADD COLUMN     "slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."provinces" ADD COLUMN     "slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."subtypes" ADD COLUMN     "slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."types" ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Administration_slug_key" ON "public"."Administration"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Area_slug_key" ON "public"."Area"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "City_slug_key" ON "public"."City"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Zone_slug_key" ON "public"."Zone"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "provinces_slug_key" ON "public"."provinces"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "subtypes_slug_key" ON "public"."subtypes"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "types_slug_key" ON "public"."types"("slug");
