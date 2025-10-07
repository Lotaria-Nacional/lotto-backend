/*
  Warnings:

  - You are about to drop the `actitivies` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `agent_actitivies` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."actitivies" DROP CONSTRAINT "actitivies_agentId_fkey";

-- DropTable
DROP TABLE "public"."actitivies";

-- DropTable
DROP TABLE "public"."agent_actitivies";
