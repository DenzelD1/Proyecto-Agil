/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "public"."User";

-- CreateTable
CREATE TABLE "public"."ProyeccionMalla" (
    "id" SERIAL NOT NULL,
    "rut" TEXT NOT NULL,
    "codigoCarrera" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "semestres" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProyeccionMalla_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProyeccionMalla_rut_codigoCarrera_idx" ON "public"."ProyeccionMalla"("rut", "codigoCarrera");

-- CreateIndex
CREATE UNIQUE INDEX "ProyeccionMalla_rut_codigoCarrera_nombre_key" ON "public"."ProyeccionMalla"("rut", "codigoCarrera", "nombre");
