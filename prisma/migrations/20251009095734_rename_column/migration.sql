/*
  Warnings:

  - The primary key for the `agent_activities` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `agent_id` on the `agent_activities` table. All the data in the column will be lost.
  - The required column `id` was added to the `agent_activities` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE "public"."activities" DROP CONSTRAINT "activities_agent_id_fkey";

-- AlterTable
ALTER TABLE "public"."agent_activities" DROP CONSTRAINT "agent_activities_pkey",
DROP COLUMN "agent_id",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "agent_activities_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "public"."activities" ADD CONSTRAINT "activities_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "public"."agent_activities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
