-- CreateEnum
CREATE TYPE "public"."AgentActivityStatus" AS ENUM ('blocked', 'active');

-- CreateEnum
CREATE TYPE "public"."AgentType" AS ENUM ('lotaria_nacional', 'revendedor');

-- CreateEnum
CREATE TYPE "public"."Genre" AS ENUM ('male', 'female');

-- CreateEnum
CREATE TYPE "public"."AgentStatus" AS ENUM ('active', 'denied', 'scheduled', 'approved', 'ready', 'disapproved', 'discontinued');

-- CreateEnum
CREATE TYPE "public"."TerminalStatus" AS ENUM ('ready', 'fixed', 'lost', 'on_field', 'training', 'stock', 'broken', 'maintenance', 'discontinued');

-- CreateEnum
CREATE TYPE "public"."LicenceStatus" AS ENUM ('free', 'used');

-- CreateEnum
CREATE TYPE "public"."PosStatus" AS ENUM ('pending', 'approved', 'active', 'denied', 'discontinued');

-- CreateEnum
CREATE TYPE "public"."SimCardStatus" AS ENUM ('active', 'stock');

-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('user', 'dev', 'admin', 'area_manager', 'supervisor');

-- CreateEnum
CREATE TYPE "public"."Modules" AS ENUM ('POS', 'USER', 'AGENT', 'LICENCE', 'TERMINAL', 'SIM_CARD', 'MAINTAINANCE', 'GROUP', 'INVENTORY', 'TRAINING', 'all');

-- CreateEnum
CREATE TYPE "public"."Actions" AS ENUM ('READ', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'IMPORT', 'APPROVE', 'DENY', 'REPROVE', 'BLOCK', 'RESET', 'ASSOCIATE', 'manage', 'RESCHEDULE', 'DISCONTINUE', 'ACTIVATE', 'DESACTIVATE', 'REACTIVATE', 'FIX', 'REPORT');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "public"."UserRole" NOT NULL DEFAULT 'user',
    "zone_id" TEXT,
    "area_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."agents" (
    "id" TEXT NOT NULL,
    "id_reference" INTEGER,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "genre" "public"."Genre" NOT NULL,
    "phone_number" TEXT,
    "afrimoney_number" TEXT,
    "agent_type" "public"."AgentType" NOT NULL,
    "bi_number" TEXT,
    "status" "public"."AgentStatus" NOT NULL DEFAULT 'scheduled',
    "training_date" TIMESTAMP(3),
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."terminals" (
    "id" TEXT NOT NULL,
    "serial" TEXT NOT NULL,
    "device_id" TEXT,
    "note" TEXT,
    "status" "public"."TerminalStatus" DEFAULT 'stock',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "arrived_at" TIMESTAMP(3),
    "leaved_at" TIMESTAMP(3),
    "delivery_at" TIMESTAMP(3),
    "activated_at" TIMESTAMP(3),
    "agent_id_reference" INTEGER,

    CONSTRAINT "terminals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sim_cards" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "chip_serial_number" TEXT,
    "pin" TEXT,
    "puk" TEXT,
    "status" "public"."SimCardStatus" NOT NULL DEFAULT 'stock',
    "arrived_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "terminal_id" TEXT,

    CONSTRAINT "sim_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."pos" (
    "id" TEXT NOT NULL,
    "coordinates" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "status" "public"."PosStatus" DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "admin_name" TEXT,
    "licence_reference" TEXT,
    "agent_id_reference" INTEGER,
    "area_name" TEXT,
    "zone_number" INTEGER,
    "city_name" TEXT,
    "province_name" TEXT,
    "type_name" TEXT,
    "subtype_name" TEXT,

    CONSTRAINT "pos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."licences" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "district" TEXT,
    "reference" TEXT NOT NULL,
    "limit" INTEGER NOT NULL DEFAULT 1,
    "status" "public"."LicenceStatus" NOT NULL DEFAULT 'free',
    "emitted_at" TIMESTAMP(3) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "file" TEXT,
    "coordinates" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "admin_name" TEXT,

    CONSTRAINT "licences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."administrations" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "administrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."provinces" (
    "name" TEXT NOT NULL,
    "id" SERIAL NOT NULL,

    CONSTRAINT "provinces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cities" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "province_id" INTEGER NOT NULL,
    "zone_id" INTEGER,
    "area_id" INTEGER,
    "administration_id" INTEGER,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."zones" (
    "id" SERIAL NOT NULL,
    "number" INTEGER NOT NULL,

    CONSTRAINT "zones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."areas" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "areas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."types" (
    "name" TEXT NOT NULL,
    "id" SERIAL NOT NULL,

    CONSTRAINT "types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."subtypes" (
    "name" TEXT NOT NULL,
    "id" SERIAL NOT NULL,
    "type_id" INTEGER NOT NULL,

    CONSTRAINT "subtypes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."audit_logs" (
    "id" TEXT NOT NULL,
    "entity" "public"."Modules" NOT NULL,
    "user_name" TEXT NOT NULL,
    "user_email" TEXT NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "action" "public"."Actions" NOT NULL,
    "changes" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."id_references" (
    "id" SERIAL NOT NULL,
    "counter" SERIAL NOT NULL,
    "type" "public"."AgentType" NOT NULL,

    CONSTRAINT "id_references_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."password_reset_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."memberships" (
    "user_id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,

    CONSTRAINT "memberships_pkey" PRIMARY KEY ("user_id","group_id")
);

-- CreateTable
CREATE TABLE "public"."group_permissions" (
    "id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "module" "public"."Modules" NOT NULL,
    "action" "public"."Actions"[],

    CONSTRAINT "group_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."agent_activities" (
    "id" TEXT NOT NULL,
    "area" TEXT,
    "zone" TEXT,
    "status" "public"."AgentActivityStatus" DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."agent_daily_balances" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "deposit" DECIMAL(18,2),
    "debt" DECIMAL(18,2),
    "balance" DECIMAL(18,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_daily_balances_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "agents_id_reference_key" ON "public"."agents"("id_reference");

-- CreateIndex
CREATE UNIQUE INDEX "terminals_serial_key" ON "public"."terminals"("serial");

-- CreateIndex
CREATE UNIQUE INDEX "terminals_agent_id_reference_key" ON "public"."terminals"("agent_id_reference");

-- CreateIndex
CREATE UNIQUE INDEX "sim_cards_number_key" ON "public"."sim_cards"("number");

-- CreateIndex
CREATE UNIQUE INDEX "sim_cards_terminal_id_key" ON "public"."sim_cards"("terminal_id");

-- CreateIndex
CREATE UNIQUE INDEX "pos_agent_id_reference_key" ON "public"."pos"("agent_id_reference");

-- CreateIndex
CREATE UNIQUE INDEX "licences_reference_key" ON "public"."licences"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "administrations_name_key" ON "public"."administrations"("name");

-- CreateIndex
CREATE UNIQUE INDEX "provinces_name_key" ON "public"."provinces"("name");

-- CreateIndex
CREATE UNIQUE INDEX "cities_name_key" ON "public"."cities"("name");

-- CreateIndex
CREATE UNIQUE INDEX "zones_number_key" ON "public"."zones"("number");

-- CreateIndex
CREATE UNIQUE INDEX "areas_name_key" ON "public"."areas"("name");

-- CreateIndex
CREATE UNIQUE INDEX "types_name_key" ON "public"."types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "subtypes_name_key" ON "public"."subtypes"("name");

-- CreateIndex
CREATE UNIQUE INDEX "id_references_type_key" ON "public"."id_references"("type");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_key" ON "public"."password_reset_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_user_id_key" ON "public"."password_reset_tokens"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "group_permissions_group_id_module_key" ON "public"."group_permissions"("group_id", "module");

-- CreateIndex
CREATE UNIQUE INDEX "agent_daily_balances_agentId_date_key" ON "public"."agent_daily_balances"("agentId", "date");

-- AddForeignKey
ALTER TABLE "public"."terminals" ADD CONSTRAINT "terminals_agent_id_reference_fkey" FOREIGN KEY ("agent_id_reference") REFERENCES "public"."agents"("id_reference") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sim_cards" ADD CONSTRAINT "sim_cards_terminal_id_fkey" FOREIGN KEY ("terminal_id") REFERENCES "public"."terminals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pos" ADD CONSTRAINT "pos_admin_name_fkey" FOREIGN KEY ("admin_name") REFERENCES "public"."administrations"("name") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pos" ADD CONSTRAINT "pos_licence_reference_fkey" FOREIGN KEY ("licence_reference") REFERENCES "public"."licences"("reference") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pos" ADD CONSTRAINT "pos_agent_id_reference_fkey" FOREIGN KEY ("agent_id_reference") REFERENCES "public"."agents"("id_reference") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pos" ADD CONSTRAINT "pos_area_name_fkey" FOREIGN KEY ("area_name") REFERENCES "public"."areas"("name") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pos" ADD CONSTRAINT "pos_zone_number_fkey" FOREIGN KEY ("zone_number") REFERENCES "public"."zones"("number") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pos" ADD CONSTRAINT "pos_city_name_fkey" FOREIGN KEY ("city_name") REFERENCES "public"."cities"("name") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pos" ADD CONSTRAINT "pos_province_name_fkey" FOREIGN KEY ("province_name") REFERENCES "public"."provinces"("name") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pos" ADD CONSTRAINT "pos_type_name_fkey" FOREIGN KEY ("type_name") REFERENCES "public"."types"("name") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pos" ADD CONSTRAINT "pos_subtype_name_fkey" FOREIGN KEY ("subtype_name") REFERENCES "public"."subtypes"("name") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."licences" ADD CONSTRAINT "licences_admin_name_fkey" FOREIGN KEY ("admin_name") REFERENCES "public"."administrations"("name") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cities" ADD CONSTRAINT "cities_province_id_fkey" FOREIGN KEY ("province_id") REFERENCES "public"."provinces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cities" ADD CONSTRAINT "cities_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "public"."zones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cities" ADD CONSTRAINT "cities_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "public"."areas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cities" ADD CONSTRAINT "cities_administration_id_fkey" FOREIGN KEY ("administration_id") REFERENCES "public"."administrations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subtypes" ADD CONSTRAINT "subtypes_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "public"."types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."memberships" ADD CONSTRAINT "memberships_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."memberships" ADD CONSTRAINT "memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."group_permissions" ADD CONSTRAINT "group_permissions_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."agent_daily_balances" ADD CONSTRAINT "agent_daily_balances_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "public"."agent_activities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
