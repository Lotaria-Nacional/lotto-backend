-- AlterTable
ALTER TABLE "public"."licences" ALTER COLUMN "emitted_at" DROP NOT NULL,
ALTER COLUMN "expires_at" DROP NOT NULL;
