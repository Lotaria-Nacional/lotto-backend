-- CreateTable
CREATE TABLE "public"."afrimoney_activities" (
    "id" TEXT NOT NULL,
    "remarks" TEXT,
    "transfer_value" TEXT,
    "account_id" TEXT,
    "transfer_date" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "afrimoney_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."koralplay_activities" (
    "id" TEXT NOT NULL,
    "staff_reference" TEXT,
    "group_name" TEXT,
    "ggr_amount" TEXT,
    "date" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "koralplay_activities_pkey" PRIMARY KEY ("id")
);
