/*
  Warnings:

  - The values [ativo,negado,agendado,apto] on the enum `AgentStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [masculino,feminino] on the enum `Genre` will be removed. If these variants are still used in the database, this will fail.
  - The values [livre,uso] on the enum `LicenceStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [por_avaliar,aprovado,ativo,negado] on the enum `PosStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [em_campo,formacao,avaria,manutencao] on the enum `TerminalStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."AgentStatus_new" AS ENUM ('active', 'denied', 'scheduled', 'approved');
ALTER TABLE "public"."agents" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."agents" ALTER COLUMN "status" TYPE "public"."AgentStatus_new" USING ("status"::text::"public"."AgentStatus_new");
ALTER TYPE "public"."AgentStatus" RENAME TO "AgentStatus_old";
ALTER TYPE "public"."AgentStatus_new" RENAME TO "AgentStatus";
DROP TYPE "public"."AgentStatus_old";
ALTER TABLE "public"."agents" ALTER COLUMN "status" SET DEFAULT 'scheduled';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."Genre_new" AS ENUM ('male', 'female');
ALTER TABLE "public"."agents" ALTER COLUMN "genre" TYPE "public"."Genre_new" USING ("genre"::text::"public"."Genre_new");
ALTER TYPE "public"."Genre" RENAME TO "Genre_old";
ALTER TYPE "public"."Genre_new" RENAME TO "Genre";
DROP TYPE "public"."Genre_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."LicenceStatus_new" AS ENUM ('free', 'used');
ALTER TABLE "public"."licences" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."licences" ALTER COLUMN "status" TYPE "public"."LicenceStatus_new" USING ("status"::text::"public"."LicenceStatus_new");
ALTER TYPE "public"."LicenceStatus" RENAME TO "LicenceStatus_old";
ALTER TYPE "public"."LicenceStatus_new" RENAME TO "LicenceStatus";
DROP TYPE "public"."LicenceStatus_old";
ALTER TABLE "public"."licences" ALTER COLUMN "status" SET DEFAULT 'free';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."PosStatus_new" AS ENUM ('pending', 'approved', 'active', 'denied');
ALTER TABLE "public"."pos" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."pos" ALTER COLUMN "status" TYPE "public"."PosStatus_new" USING ("status"::text::"public"."PosStatus_new");
ALTER TYPE "public"."PosStatus" RENAME TO "PosStatus_old";
ALTER TYPE "public"."PosStatus_new" RENAME TO "PosStatus";
DROP TYPE "public"."PosStatus_old";
ALTER TABLE "public"."pos" ALTER COLUMN "status" SET DEFAULT 'pending';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."TerminalStatus_new" AS ENUM ('active', 'training', 'stock', 'broken', 'maintenance');
ALTER TABLE "public"."terminals" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."terminals" ALTER COLUMN "status" TYPE "public"."TerminalStatus_new" USING ("status"::text::"public"."TerminalStatus_new");
ALTER TYPE "public"."TerminalStatus" RENAME TO "TerminalStatus_old";
ALTER TYPE "public"."TerminalStatus_new" RENAME TO "TerminalStatus";
DROP TYPE "public"."TerminalStatus_old";
ALTER TABLE "public"."terminals" ALTER COLUMN "status" SET DEFAULT 'stock';
COMMIT;

-- AlterTable
ALTER TABLE "public"."agents" ALTER COLUMN "status" SET DEFAULT 'scheduled';

-- AlterTable
ALTER TABLE "public"."licences" ALTER COLUMN "status" SET DEFAULT 'free';

-- AlterTable
ALTER TABLE "public"."pos" ALTER COLUMN "status" SET DEFAULT 'pending';
