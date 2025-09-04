-- CreateEnum
CREATE TYPE "public"."AgentType" AS ENUM ('lotaria_nacional', 'revendedor');

-- CreateEnum
CREATE TYPE "public"."Genre" AS ENUM ('masculino', 'feminino');

-- CreateEnum
CREATE TYPE "public"."AgentStatus" AS ENUM ('ativo', 'negado', 'agendado', 'apto');

-- CreateEnum
CREATE TYPE "public"."TerminalStatus" AS ENUM ('em_campo', 'formacao', 'stock', 'avaria', 'manutencao');

-- CreateEnum
CREATE TYPE "public"."LicenceStatus" AS ENUM ('livre', 'em_uso');

-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('user', 'dev', 'admin', 'area_manager', 'supervisor');

-- CreateEnum
CREATE TYPE "public"."AuditAction" AS ENUM ('create', 'update', 'delete');

-- CreateEnum
CREATE TYPE "public"."Modules" AS ENUM ('POS', 'USER', 'AGENT', 'LICENCE', 'TERMINAL', 'SIM_CARD');

-- CreateEnum
CREATE TYPE "public"."Actions" AS ENUM ('READ', 'WRITE', 'UPDATE', 'DELETE', 'EXPORT', 'IMPORT');

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
    "phone_number" INTEGER,
    "afrimoney_number" INTEGER,
    "agent_type" "public"."AgentType" NOT NULL,
    "bi_number" TEXT,
    "status" "public"."AgentStatus" NOT NULL DEFAULT 'agendado',
    "area_id" INTEGER,
    "city_id" INTEGER,
    "type_id" INTEGER,
    "zone_id" INTEGER,
    "subtype_id" INTEGER,
    "province_id" INTEGER,
    "training_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."terminals" (
    "id" TEXT NOT NULL,
    "id_reference" INTEGER,
    "serial" TEXT NOT NULL,
    "device_id" TEXT,
    "note" TEXT,
    "status" "public"."TerminalStatus" DEFAULT 'stock',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "arrived_at" TIMESTAMP(3),
    "area_id" INTEGER,
    "city_id" INTEGER,
    "zone_id" INTEGER,
    "province_id" INTEGER,
    "agent_id" TEXT,

    CONSTRAINT "terminals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sim_cards" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "pin" INTEGER,
    "puk" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "terminal_id" TEXT,

    CONSTRAINT "sim_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."pos" (
    "id" TEXT NOT NULL,
    "id_reference" INTEGER,
    "coordinates" TEXT NOT NULL,
    "agent_id" TEXT,
    "licence_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "admin_id" INTEGER,
    "area_id" INTEGER,
    "province_id" INTEGER,
    "subtype_id" INTEGER,
    "type_id" INTEGER,
    "zone_id" INTEGER,
    "city_id" INTEGER,

    CONSTRAINT "pos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."licences" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "file" TEXT,
    "coordinates" TEXT,
    "reference" TEXT NOT NULL,
    "limit" INTEGER NOT NULL DEFAULT 1,
    "status" "public"."LicenceStatus" NOT NULL DEFAULT 'livre',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "creation_date" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "admin_id" INTEGER,

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
    "name" TEXT NOT NULL,
    "id" SERIAL NOT NULL,
    "province_id" INTEGER NOT NULL,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."areas" (
    "name" TEXT NOT NULL,
    "id" SERIAL NOT NULL,

    CONSTRAINT "areas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."zones" (
    "number" INTEGER NOT NULL,
    "id" SERIAL NOT NULL,
    "area_id" INTEGER NOT NULL,

    CONSTRAINT "zones_pkey" PRIMARY KEY ("id")
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
    "action" "public"."AuditAction" NOT NULL,
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
CREATE TABLE "public"."Membership" (
    "user_id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,

    CONSTRAINT "Membership_pkey" PRIMARY KEY ("user_id","group_id")
);

-- CreateTable
CREATE TABLE "public"."GroupPermission" (
    "id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "module" "public"."Modules" NOT NULL,
    "action" "public"."Actions"[],

    CONSTRAINT "GroupPermission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "agents_id_reference_key" ON "public"."agents"("id_reference");

-- CreateIndex
CREATE UNIQUE INDEX "terminals_id_reference_key" ON "public"."terminals"("id_reference");

-- CreateIndex
CREATE UNIQUE INDEX "terminals_agent_id_key" ON "public"."terminals"("agent_id");

-- CreateIndex
CREATE UNIQUE INDEX "sim_cards_terminal_id_key" ON "public"."sim_cards"("terminal_id");

-- CreateIndex
CREATE UNIQUE INDEX "pos_id_reference_key" ON "public"."pos"("id_reference");

-- CreateIndex
CREATE UNIQUE INDEX "pos_agent_id_key" ON "public"."pos"("agent_id");

-- CreateIndex
CREATE UNIQUE INDEX "provinces_name_key" ON "public"."provinces"("name");

-- CreateIndex
CREATE UNIQUE INDEX "cities_name_key" ON "public"."cities"("name");

-- CreateIndex
CREATE UNIQUE INDEX "areas_name_key" ON "public"."areas"("name");

-- CreateIndex
CREATE UNIQUE INDEX "zones_number_key" ON "public"."zones"("number");

-- CreateIndex
CREATE UNIQUE INDEX "id_references_type_key" ON "public"."id_references"("type");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_key" ON "public"."password_reset_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_user_id_key" ON "public"."password_reset_tokens"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "GroupPermission_group_id_module_key" ON "public"."GroupPermission"("group_id", "module");

-- AddForeignKey
ALTER TABLE "public"."agents" ADD CONSTRAINT "agents_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "public"."areas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."agents" ADD CONSTRAINT "agents_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."agents" ADD CONSTRAINT "agents_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "public"."types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."agents" ADD CONSTRAINT "agents_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "public"."zones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."agents" ADD CONSTRAINT "agents_subtype_id_fkey" FOREIGN KEY ("subtype_id") REFERENCES "public"."subtypes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."agents" ADD CONSTRAINT "agents_province_id_fkey" FOREIGN KEY ("province_id") REFERENCES "public"."provinces"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."terminals" ADD CONSTRAINT "terminals_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "public"."areas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."terminals" ADD CONSTRAINT "terminals_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."terminals" ADD CONSTRAINT "terminals_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "public"."zones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."terminals" ADD CONSTRAINT "terminals_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."terminals" ADD CONSTRAINT "terminals_province_id_fkey" FOREIGN KEY ("province_id") REFERENCES "public"."provinces"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sim_cards" ADD CONSTRAINT "sim_cards_terminal_id_fkey" FOREIGN KEY ("terminal_id") REFERENCES "public"."terminals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pos" ADD CONSTRAINT "pos_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "public"."areas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pos" ADD CONSTRAINT "pos_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pos" ADD CONSTRAINT "pos_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "public"."types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pos" ADD CONSTRAINT "pos_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "public"."zones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pos" ADD CONSTRAINT "pos_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "public"."administrations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pos" ADD CONSTRAINT "pos_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pos" ADD CONSTRAINT "pos_subtype_id_fkey" FOREIGN KEY ("subtype_id") REFERENCES "public"."subtypes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pos" ADD CONSTRAINT "pos_licence_id_fkey" FOREIGN KEY ("licence_id") REFERENCES "public"."licences"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pos" ADD CONSTRAINT "pos_province_id_fkey" FOREIGN KEY ("province_id") REFERENCES "public"."provinces"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."licences" ADD CONSTRAINT "licences_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "public"."administrations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cities" ADD CONSTRAINT "cities_province_id_fkey" FOREIGN KEY ("province_id") REFERENCES "public"."provinces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."zones" ADD CONSTRAINT "zones_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "public"."areas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subtypes" ADD CONSTRAINT "subtypes_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "public"."types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Membership" ADD CONSTRAINT "Membership_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Membership" ADD CONSTRAINT "Membership_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GroupPermission" ADD CONSTRAINT "GroupPermission_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
