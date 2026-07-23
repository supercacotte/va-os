import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { getActivityReport } from "@/lib/data/reports";
import { renderActivityReportPdf } from "@/lib/pdf/activity-report";

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

export async function GET(req: NextRequest) {
  const session = await auth();
  if (session?.user.role !== "VA") {
    return new NextResponse("Non autorisé", { status: 401 });
  }

  const clientId = req.nextUrl.searchParams.get("client");
  const mois = req.nextUrl.searchParams.get("mois");
  if (!clientId || !mois || !MONTH_RE.test(mois)) {
    return new NextResponse("Paramètres invalides", { status: 400 });
  }

  const [year, month] = mois.split("-").map(Number);
  const report = await getActivityReport(
    session.user.id,
    clientId,
    new Date(Date.UTC(year, month - 1, 1)),
    new Date(Date.UTC(year, month, 1)),
  );
  if (!report) {
    return new NextResponse("Client introuvable", { status: 404 });
  }

  const periodLabel = new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(report.periodStart);

  const buffer = await renderActivityReportPdf(report, periodLabel);

  const slug = report.client.name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="rapport-${slug}-${mois}.pdf"`,
    },
  });
}
