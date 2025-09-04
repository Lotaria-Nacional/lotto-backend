/*
  Warnings:

  - You are about to drop the column `id_reference` on the `pos` table. All the data in the column will be lost.
  - Made the column `admin_id` on table `pos` required. This step will fail if there are existing NULL values in that column.
  - Made the column `province_id` on table `pos` required. This step will fail if there are existing NULL values in that column.
  - Made the column `city_id` on table `pos` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "public"."PosStatus" AS ENUM ('por_avaliar', 'aprovado', 'ativo', 'negado');

-- DropForeignKey
ALTER TABLE "public"."pos" DROP CONSTRAINT "pos_admin_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."pos" DROP CONSTRAINT "pos_city_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."pos" DROP CONSTRAINT "pos_province_id_fkey";

-- DropIndex
DROP INDEX "public"."pos_id_reference_key";

-- AlterTable
ALTER TABLE "public"."pos" DROP COLUMN "id_reference",
ADD COLUMN     "status" "public"."PosStatus" NOT NULL DEFAULT 'por_avaliar',
ALTER COLUMN "admin_id" SET NOT NULL,
ALTER COLUMN "province_id" SET NOT NULL,
ALTER COLUMN "city_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."pos" ADD CONSTRAINT "pos_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pos" ADD CONSTRAINT "pos_province_id_fkey" FOREIGN KEY ("province_id") REFERENCES "public"."provinces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pos" ADD CONSTRAINT "pos_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "public"."administrations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
