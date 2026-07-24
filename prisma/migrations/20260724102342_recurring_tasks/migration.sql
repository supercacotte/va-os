-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "recurringPeriod" TEXT,
ADD COLUMN     "recurringTaskId" TEXT;

-- CreateTable
CREATE TABLE "RecurringTask" (
    "id" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "cadence" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecurringTask_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Task_recurringTaskId_recurringPeriod_key" ON "Task"("recurringTaskId", "recurringPeriod");

-- AddForeignKey
ALTER TABLE "RecurringTask" ADD CONSTRAINT "RecurringTask_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_recurringTaskId_fkey" FOREIGN KEY ("recurringTaskId") REFERENCES "RecurringTask"("id") ON DELETE SET NULL ON UPDATE CASCADE;

