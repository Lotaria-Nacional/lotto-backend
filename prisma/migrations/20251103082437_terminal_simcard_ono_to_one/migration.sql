/*
  Warnings:

  - A unique constraint covering the columns `[terminal_id]` on the table `sim_cards` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "sim_cards_terminal_id_key" ON "public"."sim_cards"("terminal_id");
