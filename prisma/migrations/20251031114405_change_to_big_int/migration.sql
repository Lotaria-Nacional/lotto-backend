-- AlterTable
ALTER TABLE "public"."afrimoney" ALTER COLUMN "remarks" SET DATA TYPE BIGINT,
ALTER COLUMN "transferValue" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "public"."koral_play" ALTER COLUMN "operation" SET DATA TYPE BIGINT,
ALTER COLUMN "senderAccountId" SET DATA TYPE BIGINT,
ALTER COLUMN "senderStaffReference" SET DATA TYPE BIGINT,
ALTER COLUMN "receiverAccountId" SET DATA TYPE BIGINT,
ALTER COLUMN "ReceiverStaffReference" SET DATA TYPE BIGINT;
