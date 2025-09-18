/*
  Warnings:

  - You are about to drop the column `admin_id` on the `licences` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."licences" DROP CONSTRAINT "licences_admin_id_fkey";

-- AlterTable
ALTER TABLE "public"."licences" DROP COLUMN "admin_id",
ADD COLUMN     "admin_name" TEXT;

-- AddForeignKey
ALTER TABLE "public"."licences" ADD CONSTRAINT "licences_admin_name_fkey" FOREIGN KEY ("admin_name") REFERENCES "public"."Administration"("name") ON DELETE SET NULL ON UPDATE CASCADE;
