/*
  Warnings:

  - You are about to drop the `administrations` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."licences" DROP CONSTRAINT "licences_admin_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."pos" DROP CONSTRAINT "pos_admin_name_fkey";

-- DropTable
DROP TABLE "public"."administrations";

-- CreateTable
CREATE TABLE "public"."Administration" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "city_id" INTEGER,

    CONSTRAINT "Administration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Administration_name_key" ON "public"."Administration"("name");

-- AddForeignKey
ALTER TABLE "public"."pos" ADD CONSTRAINT "pos_admin_name_fkey" FOREIGN KEY ("admin_name") REFERENCES "public"."Administration"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."licences" ADD CONSTRAINT "licences_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "public"."Administration"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Administration" ADD CONSTRAINT "Administration_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "public"."City"("id") ON DELETE SET NULL ON UPDATE CASCADE;
