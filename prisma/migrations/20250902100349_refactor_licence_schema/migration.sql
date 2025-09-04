/*
  Warnings:

  - The values [em_uso] on the enum `LicenceStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `creation_date` on the `licences` table. All the data in the column will be lost.
  - Added the required column `emitted_at` to the `licences` table without a default value. This is not possible if the table is not empty.
  - Made the column `expires_at` on table `licences` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."LicenceStatus_new" AS ENUM ('livre', 'uso');
ALTER TABLE "public"."licences" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."licences" ALTER COLUMN "status" TYPE "public"."LicenceStatus_new" USING ("status"::text::"public"."LicenceStatus_new");
ALTER TYPE "public"."LicenceStatus" RENAME TO "LicenceStatus_old";
ALTER TYPE "public"."LicenceStatus_new" RENAME TO "LicenceStatus";
DROP TYPE "public"."LicenceStatus_old";
ALTER TABLE "public"."licences" ALTER COLUMN "status" SET DEFAULT 'livre';
COMMIT;

-- AlterTable
ALTER TABLE "public"."licences" DROP COLUMN "creation_date",
ADD COLUMN     "emitted_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "expires_at" SET NOT NULL;
