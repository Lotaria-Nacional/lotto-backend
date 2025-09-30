-- DropForeignKey
ALTER TABLE "public"."pos" DROP CONSTRAINT "pos_admin_name_fkey";

-- DropForeignKey
ALTER TABLE "public"."pos" DROP CONSTRAINT "pos_city_name_fkey";

-- DropForeignKey
ALTER TABLE "public"."pos" DROP CONSTRAINT "pos_province_name_fkey";

-- DropForeignKey
ALTER TABLE "public"."pos" DROP CONSTRAINT "pos_subtype_name_fkey";

-- DropForeignKey
ALTER TABLE "public"."pos" DROP CONSTRAINT "pos_type_name_fkey";

-- AddForeignKey
ALTER TABLE "public"."pos" ADD CONSTRAINT "pos_admin_name_fkey" FOREIGN KEY ("admin_name") REFERENCES "public"."Administration"("slug") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pos" ADD CONSTRAINT "pos_city_name_fkey" FOREIGN KEY ("city_name") REFERENCES "public"."City"("slug") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pos" ADD CONSTRAINT "pos_province_name_fkey" FOREIGN KEY ("province_name") REFERENCES "public"."provinces"("slug") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pos" ADD CONSTRAINT "pos_type_name_fkey" FOREIGN KEY ("type_name") REFERENCES "public"."types"("slug") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pos" ADD CONSTRAINT "pos_subtype_name_fkey" FOREIGN KEY ("subtype_name") REFERENCES "public"."subtypes"("slug") ON DELETE SET NULL ON UPDATE CASCADE;
