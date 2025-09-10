-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."Actions" ADD VALUE 'APPROVE';
ALTER TYPE "public"."Actions" ADD VALUE 'REPROVE';
ALTER TYPE "public"."Actions" ADD VALUE 'BLOCK';
ALTER TYPE "public"."Actions" ADD VALUE 'RESET';
ALTER TYPE "public"."Actions" ADD VALUE 'ASSOCIATE';

-- AlterEnum
ALTER TYPE "public"."Modules" ADD VALUE 'MAINTAINANCE';
