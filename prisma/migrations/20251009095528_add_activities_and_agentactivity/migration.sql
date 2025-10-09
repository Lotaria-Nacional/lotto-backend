-- CreateEnum
CREATE TYPE "public"."SourceType" AS ENUM ('AFRIMONEY', 'KORAL_PLAY');

-- CreateTable
CREATE TABLE "public"."agent_activities" (
    "agent_id" TEXT NOT NULL,
    "area" TEXT,
    "zone" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "upadated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_activities_pkey" PRIMARY KEY ("agent_id")
);

-- CreateTable
CREATE TABLE "public"."activities" (
    "id" TEXT NOT NULL,
    "agent_id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "source" "public"."SourceType" NOT NULL,
    "deposit" DECIMAL(18,2),
    "debit" DECIMAL(18,2),
    "balance" DECIMAL(18,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."activities" ADD CONSTRAINT "activities_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "public"."agent_activities"("agent_id") ON DELETE RESTRICT ON UPDATE CASCADE;
