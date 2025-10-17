/*
  Warnings:

  - You are about to drop the `Activity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AgentActivity` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Activity" DROP CONSTRAINT "Activity_agentId_fkey";

-- DropTable
DROP TABLE "public"."Activity";

-- DropTable
DROP TABLE "public"."AgentActivity";

-- CreateTable
CREATE TABLE "public"."agent_actitivies" (
    "id" TEXT NOT NULL,
    "area" TEXT,
    "zone" TEXT,
    "actualBalance" DECIMAL(65,30) NOT NULL DEFAULT 0,

    CONSTRAINT "agent_actitivies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."actitivies" (
    "id" TEXT NOT NULL,
    "debt" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "deposit" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "balance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "agentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "actitivies_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."actitivies" ADD CONSTRAINT "actitivies_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "public"."agent_actitivies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
