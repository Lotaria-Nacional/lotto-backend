-- AlterTable
ALTER TABLE "public"."licences" ALTER COLUMN "coordinates" DROP NOT NULL,
ALTER COLUMN "latitude" DROP NOT NULL,
ALTER COLUMN "longitude" DROP NOT NULL;
