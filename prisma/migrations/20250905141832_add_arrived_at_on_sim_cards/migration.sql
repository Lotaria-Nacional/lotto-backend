-- AlterTable
ALTER TABLE "public"."sim_cards" ADD COLUMN     "arrived_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
