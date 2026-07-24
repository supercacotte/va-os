import { NextResponse } from "next/server";
import JSZip from "jszip";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// Export « Mes données » (maquette 30b) : un ZIP de CSV, tout l'espace de la
// VA connectée — D12 : chaque requête est filtrée par son vaId.

function csv(rows: (string | number | boolean | null | undefined)[][]) {
  return rows
    .map((row) =>
      row
        .map((cell) => {
          const value = cell === null || cell === undefined ? "" : String(cell);
          return /[";\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
        })
        .join(";"),
    )
    .join("\n");
}

const date = (d: Date | null | undefined) => (d ? d.toISOString() : "");

export async function GET() {
  const session = await auth();
  if (session?.user.role !== "VA") {
    return new NextResponse("Non autorisé", { status: 401 });
  }
  const vaId = session.user.id;

  const [clients, missions, tasks, timeEntries, reports] = await Promise.all([
    prisma.client.findMany({
      where: { vaId },
      include: { portalUser: { select: { email: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.mission.findMany({
      where: { client: { vaId } },
      include: { client: { select: { name: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.task.findMany({
      where: { mission: { client: { vaId } } },
      include: { mission: { select: { name: true, client: { select: { name: true } } } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.timeEntry.findMany({
      where: { task: { mission: { client: { vaId } } } },
      include: {
        task: {
          select: { title: true, mission: { select: { name: true, client: { select: { name: true } } } } },
        },
      },
      orderBy: { startedAt: "asc" },
    }),
    prisma.report.findMany({
      where: { client: { vaId } },
      include: { client: { select: { name: true } } },
      orderBy: { month: "asc" },
    }),
  ]);

  const zip = new JSZip();

  zip.file(
    "clients.csv",
    csv([
      ["nom", "entreprise", "email_portail", "rapports_portail", "cree_le"],
      ...clients.map((c) => [
        c.name,
        c.company,
        c.portalUser?.email,
        c.portalReportsEnabled,
        date(c.createdAt),
      ]),
    ]),
  );

  zip.file(
    "missions.csv",
    csv([
      ["cliente", "mission", "statut", "creee_le"],
      ...missions.map((m) => [m.client.name, m.name, m.status, date(m.createdAt)]),
    ]),
  );

  zip.file(
    "taches.csv",
    csv([
      ["cliente", "mission", "tache", "faite", "source", "periode_recurrence", "creee_le"],
      ...tasks.map((t) => [
        t.mission.client.name,
        t.mission.name,
        t.title,
        t.done,
        t.source,
        t.recurringPeriod,
        date(t.createdAt),
      ]),
    ]),
  );

  zip.file(
    "temps.csv",
    csv([
      ["cliente", "mission", "tache", "note", "debut", "fin", "minutes"],
      ...timeEntries.map((e) => [
        e.task.mission.client.name,
        e.task.mission.name,
        e.task.title,
        e.label,
        date(e.startedAt),
        date(e.endedAt),
        e.endedAt ? Math.round((e.endedAt.getTime() - e.startedAt.getTime()) / 60_000) : "",
      ]),
    ]),
  );

  zip.file(
    "rapports.csv",
    csv([
      ["cliente", "mois", "genere_le"],
      ...reports.map((r) => [r.client.name, r.month, date(r.generatedAt)]),
    ]),
  );

  zip.file(
    "LISEZMOI.txt",
    `Export VA Desk du ${new Date().toLocaleDateString("fr-FR")}\n\nTout ton espace, en CSV (séparateur ; — s'ouvre dans Excel, Numbers ou Google Sheets) :\n- clients.csv\n- missions.csv\n- taches.csv\n- temps.csv\n- rapports.csv\n\nTout est à toi.\n`,
  );

  const body = await zip.generateAsync({ type: "uint8array" });
  const today = new Date().toISOString().slice(0, 10);

  return new NextResponse(Buffer.from(body), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="va-desk-export-${today}.zip"`,
    },
  });
}
