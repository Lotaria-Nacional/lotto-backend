-- DropForeignKey
ALTER TABLE "public"."licences" DROP CONSTRAINT "licences_admin_name_fkey";

-- AddForeignKey
ALTER TABLE "public"."licences" ADD CONSTRAINT "licences_admin_name_fkey" FOREIGN KEY ("admin_name") REFERENCES "public"."Administration"("slug") ON DELETE SET NULL ON UPDATE CASCADE;
