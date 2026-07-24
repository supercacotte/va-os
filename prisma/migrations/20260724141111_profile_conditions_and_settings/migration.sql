-- AlterTable
ALTER TABLE "VaProfile" ADD COLUMN     "capacityNote" TEXT,
ADD COLUMN     "hourlyRate" INTEGER,
ADD COLUMN     "showStats" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "UserSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "notifyClientRequest" BOOLEAN NOT NULL DEFAULT true,
    "notifyDirectoryContact" BOOLEAN NOT NULL DEFAULT true,
    "notifyLongTimer" BOOLEAN NOT NULL DEFAULT true,
    "notifyWeeklyDigest" BOOLEAN NOT NULL DEFAULT false,
    "timezone" TEXT NOT NULL DEFAULT 'Europe/Paris',
    "timerRounding" TEXT NOT NULL DEFAULT 'quarter',
    "weekStart" TEXT NOT NULL DEFAULT 'monday',
    "locale" TEXT NOT NULL DEFAULT 'fr',

    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserSettings_userId_key" ON "UserSettings"("userId");

-- AddForeignKey
ALTER TABLE "UserSettings" ADD CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

