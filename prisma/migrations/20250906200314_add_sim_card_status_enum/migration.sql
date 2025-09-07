-- CreateEnum
CREATE TYPE "public"."SimCardStatus" AS ENUM ('active', 'stock');

-- AlterTable
ALTER TABLE "public"."sim_cards" ADD COLUMN     "status" "public"."SimCardStatus" NOT NULL DEFAULT 'stock';
