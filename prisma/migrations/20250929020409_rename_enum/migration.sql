/*
  Warnings:

  - The values [DEACTIVATE] on the enum `Actions` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."Actions_new" AS ENUM ('READ', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'IMPORT', 'APPROVE', 'DENY', 'REPROVE', 'BLOCK', 'RESET', 'ASSOCIATE', 'manage', 'RESCHEDULE', 'DISCONTINUE', 'ACTIVATE', 'DESACTIVATE', 'REACTIVATE', 'FIX', 'REPORT');
ALTER TABLE "public"."audit_logs" ALTER COLUMN "action" TYPE "public"."Actions_new" USING ("action"::text::"public"."Actions_new");
ALTER TABLE "public"."group_permissions" ALTER COLUMN "action" TYPE "public"."Actions_new"[] USING ("action"::text::"public"."Actions_new"[]);
ALTER TYPE "public"."Actions" RENAME TO "Actions_old";
ALTER TYPE "public"."Actions_new" RENAME TO "Actions";
DROP TYPE "public"."Actions_old";
COMMIT;
