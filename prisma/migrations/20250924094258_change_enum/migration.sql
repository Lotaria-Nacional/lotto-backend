/*
  Warnings:

  - The values [disaproved] on the enum `AgentStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."AgentStatus_new" AS ENUM ('active', 'denied', 'scheduled', 'approved', 'ready', 'disapproved', 'discontinued');
ALTER TABLE "public"."agents" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."agents" ALTER COLUMN "status" TYPE "public"."AgentStatus_new" USING ("status"::text::"public"."AgentStatus_new");
ALTER TYPE "public"."AgentStatus" RENAME TO "AgentStatus_old";
ALTER TYPE "public"."AgentStatus_new" RENAME TO "AgentStatus";
DROP TYPE "public"."AgentStatus_old";
ALTER TABLE "public"."agents" ALTER COLUMN "status" SET DEFAULT 'scheduled';
COMMIT;
