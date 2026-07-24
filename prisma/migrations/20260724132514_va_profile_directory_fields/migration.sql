-- AlterTable
ALTER TABLE "VaProfile" ADD COLUMN     "availability" TEXT NOT NULL DEFAULT 'available',
ADD COLUMN     "availabilityNote" TEXT,
ADD COLUMN     "languages" TEXT[],
ADD COLUMN     "region" TEXT;

