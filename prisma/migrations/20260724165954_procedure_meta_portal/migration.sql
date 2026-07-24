-- AlterTable
ALTER TABLE "Procedure" ADD COLUMN     "cadence" TEXT,
ADD COLUMN     "estimatedMinutes" INTEGER,
ADD COLUMN     "visibleToClient" BOOLEAN NOT NULL DEFAULT true;

