-- AlterTable
ALTER TABLE "public"."agents" ALTER COLUMN "phone_number" SET DATA TYPE TEXT,
ALTER COLUMN "afrimoney_number" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "public"."sim_cards" ALTER COLUMN "number" SET DATA TYPE TEXT,
ALTER COLUMN "pin" SET DATA TYPE TEXT,
ALTER COLUMN "puk" SET DATA TYPE TEXT;
