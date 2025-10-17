-- CreateEnum
CREATE TYPE "public"."AgentActivityStatus" AS ENUM ('blocked', 'active');

-- AlterTable
ALTER TABLE "public"."agent_activities" ADD COLUMN     "status" "public"."AgentActivityStatus" DEFAULT 'active';
