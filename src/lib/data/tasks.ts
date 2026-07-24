import "server-only";

import { prisma } from "@/lib/prisma";
import { ensureRecurringTasksForVa } from "@/lib/data/recurring";

// D12 : le tenant (vaId) est vérifié dans la clause where de chaque fonction,
// via la chaîne mission → client pour les tâches.

// Liste plate des tâches de la VA, pour les selects (rattachement d'un temps).
export async function getTasksForVa(vaId: string) {
  await ensureRecurringTasksForVa(vaId);
  return prisma.task.findMany({
    where: { mission: { client: { vaId } } },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      title: true,
      done: true,
      mission: {
        select: {
          name: true,
          client: { select: { id: true, name: true } },
        },
      },
    },
  });
}

export async function createTaskForVa(
  vaId: string,
  missionId: string,
  title: string,
  dueDate: Date | null = null,
) {
  const mission = await prisma.mission.findFirst({
    where: { id: missionId, client: { vaId } },
    select: { id: true },
  });
  if (!mission) return null;

  return prisma.task.create({ data: { missionId, title, dueDate } });
}

export async function updateTaskForVa(
  vaId: string,
  taskId: string,
  data: { title?: string; done?: boolean; dueDate?: Date | null },
) {
  const { count } = await prisma.task.updateMany({
    where: { id: taskId, mission: { client: { vaId } } },
    data,
  });
  return count > 0;
}

export async function toggleTaskForVa(vaId: string, taskId: string) {
  const task = await prisma.task.findFirst({
    where: { id: taskId, mission: { client: { vaId } } },
    select: { id: true, done: true },
  });
  if (!task) return false;

  await prisma.task.update({
    where: { id: task.id },
    data: { done: !task.done },
  });
  return true;
}

export async function deleteTaskForVa(vaId: string, taskId: string) {
  const { count } = await prisma.task.deleteMany({
    where: { id: taskId, mission: { client: { vaId } } },
  });
  return count > 0;
}
