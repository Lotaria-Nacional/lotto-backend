/*
  Warnings:

  - The values [WRITE] on the enum `Actions` will be removed. If these variants are still used in the database, this will fail.
  - Changed the type of `action` on the `audit_logs` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."Actions_new" AS ENUM ('READ', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'IMPORT');
ALTER TABLE "public"."audit_logs" ALTER COLUMN "action" TYPE "public"."Actions_new" USING ("action"::text::"public"."Actions_new");
ALTER TABLE "public"."GroupPermission" ALTER COLUMN "action" TYPE "public"."Actions_new"[] USING ("action"::text::"public"."Actions_new"[]);
ALTER TYPE "public"."Actions" RENAME TO "Actions_old";
ALTER TYPE "public"."Actions_new" RENAME TO "Actions";
DROP TYPE "public"."Actions_old";
COMMIT;

-- AlterTable
ALTER TABLE "public"."audit_logs" DROP COLUMN "action",
ADD COLUMN     "action" "public"."Actions" NOT NULL;

-- DropEnum
DROP TYPE "public"."AuditAction";
