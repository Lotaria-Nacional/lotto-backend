/*
  Warnings:

  - You are about to drop the `activities` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."activities" DROP CONSTRAINT "activities_agent_id_fkey";

-- DropTable
DROP TABLE "public"."activities";

-- DropEnum
DROP TYPE "public"."SourceType";

-- CreateTable
CREATE TABLE "public"."agent_daily_balances" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "deposit" DECIMAL(18,2),
    "debt" DECIMAL(18,2),
    "balance" DECIMAL(18,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_daily_balances_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "agent_daily_balances_agentId_date_key" ON "public"."agent_daily_balances"("agentId", "date");

-- AddForeignKey
ALTER TABLE "public"."agent_daily_balances" ADD CONSTRAINT "agent_daily_balances_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "public"."agent_activities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
