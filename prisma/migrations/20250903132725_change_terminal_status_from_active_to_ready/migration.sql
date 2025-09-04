/*
  Warnings:

  - The values [active] on the enum `TerminalStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."TerminalStatus_new" AS ENUM ('ready', 'training', 'stock', 'broken', 'maintenance');
ALTER TABLE "public"."terminals" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."terminals" ALTER COLUMN "status" TYPE "public"."TerminalStatus_new" USING ("status"::text::"public"."TerminalStatus_new");
ALTER TYPE "public"."TerminalStatus" RENAME TO "TerminalStatus_old";
ALTER TYPE "public"."TerminalStatus_new" RENAME TO "TerminalStatus";
DROP TYPE "public"."TerminalStatus_old";
ALTER TABLE "public"."terminals" ALTER COLUMN "status" SET DEFAULT 'stock';
COMMIT;
