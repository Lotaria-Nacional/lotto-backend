-- DropForeignKey
ALTER TABLE "public"."pos" DROP CONSTRAINT "pos_admin_name_fkey";

-- DropForeignKey
ALTER TABLE "public"."pos" DROP CONSTRAINT "pos_city_name_fkey";

-- DropForeignKey
ALTER TABLE "public"."pos" DROP CONSTRAINT "pos_province_name_fkey";

-- AlterTable
ALTER TABLE "public"."pos" ALTER COLUMN "status" DROP NOT NULL,
ALTER COLUMN "latitude" DROP NOT NULL,
ALTER COLUMN "longitude" DROP NOT NULL,
ALTER COLUMN "admin_name" DROP NOT NULL,
ALTER COLUMN "city_name" DROP NOT NULL,
ALTER COLUMN "province_name" DROP NOT NULL,
ALTER COLUMN "coordinates" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."pos" ADD CONSTRAINT "pos_admin_name_fkey" FOREIGN KEY ("admin_name") REFERENCES "public"."Administration"("name") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pos" ADD CONSTRAINT "pos_city_name_fkey" FOREIGN KEY ("city_name") REFERENCES "public"."City"("name") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pos" ADD CONSTRAINT "pos_province_name_fkey" FOREIGN KEY ("province_name") REFERENCES "public"."provinces"("name") ON DELETE SET NULL ON UPDATE CASCADE;
