-- AlterTable
ALTER TABLE "public"."afrimoney" ALTER COLUMN "remarks" SET DATA TYPE TEXT,
ALTER COLUMN "transferValue" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "public"."koral_play" ALTER COLUMN "operation" SET DATA TYPE TEXT,
ALTER COLUMN "senderAccountId" SET DATA TYPE TEXT,
ALTER COLUMN "senderStaffReference" SET DATA TYPE TEXT,
ALTER COLUMN "receiverAccountId" SET DATA TYPE TEXT,
ALTER COLUMN "receiverStaffReference" SET DATA TYPE TEXT;
