/*
  Warnings:

  - You are about to drop the column `agent_id` on the `terminals` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[serial]` on the table `terminals` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[agent_id_reference]` on the table `terminals` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."terminals" DROP CONSTRAINT "terminals_agent_id_fkey";

-- DropIndex
DROP INDEX "public"."terminals_agent_id_key";

-- AlterTable
ALTER TABLE "public"."terminals" DROP COLUMN "agent_id",
ADD COLUMN     "agent_id_reference" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "terminals_serial_key" ON "public"."terminals"("serial");

-- CreateIndex
CREATE UNIQUE INDEX "terminals_agent_id_reference_key" ON "public"."terminals"("agent_id_reference");

-- AddForeignKey
ALTER TABLE "public"."terminals" ADD CONSTRAINT "terminals_agent_id_reference_fkey" FOREIGN KEY ("agent_id_reference") REFERENCES "public"."agents"("id_reference") ON DELETE SET NULL ON UPDATE CASCADE;
