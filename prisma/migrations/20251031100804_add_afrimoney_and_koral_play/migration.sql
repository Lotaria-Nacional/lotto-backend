-- CreateTable
CREATE TABLE "public"."afrimoney" (
    "id" TEXT NOT NULL,
    "transferId" TEXT,
    "serviceType" TEXT,
    "remarks" INTEGER,
    "transactionType" TEXT,
    "accountId" TEXT,
    "secondPartyAccountId" TEXT,
    "transferValue" INTEGER,
    "comission" TEXT,
    "serviceCharge" TEXT,
    "taxa" TEXT,
    "previousBalance" TEXT,
    "postBalance" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "afrimoney_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."koral_play" (
    "id" TEXT NOT NULL,
    "transferId" TEXT,
    "date" TEXT,
    "operationDate" TIMESTAMP(3),
    "operation" INTEGER,
    "amountAfter" TEXT,
    "senderAccountId" INTEGER,
    "senderDetails" TEXT,
    "senderStaffReference" INTEGER,
    "transactionType" TEXT,
    "receiverAccountId" INTEGER,
    "receiverDetails" TEXT,
    "ReceiverStaffReference" INTEGER,
    "paymentMode" TEXT,
    "signedBy" TEXT,
    "signedByStaffReference" TEXT,
    "entity" TEXT,
    "column1" TEXT,
    "column2" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "koral_play_pkey" PRIMARY KEY ("id")
);
