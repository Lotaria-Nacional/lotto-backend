/*
  Warnings:

  - You are about to drop the column `debit` on the `activities` table. All the data in the column will be lost.
  - You are about to drop the column `upadated_at` on the `agent_activities` table. All the data in the column will be lost.
  - Changed the type of `date` on the `activities` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `updated_at` to the `agent_activities` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."activities" DROP COLUMN "debit",
ADD COLUMN     "debt" DECIMAL(18,2),
DROP COLUMN "date",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."agent_activities" DROP COLUMN "upadated_at",
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;
