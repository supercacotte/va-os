import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { getActivityReportForPortalUser } from "@/lib/data/reports";
import { renderActivityReportPdf } from "@/lib/pdf/activity-report";

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

// D12 règle 4 : le client du rapport dérive de la session portail — aucun
// clientId en paramètre.
export async function GET(req: NextRequest) {
  const session = await auth();
  if (session?.user.role !== "CLIENT") {
    return new NextResponse("Non autorisé", { status: 401 });
  }

  const mois = req.nextUrl.searchParams.get("mois");
  if (!mois || !MONTH_RE.test(mois)) {
    return new NextResponse("Paramètres invalides", { status: 400 });
  }

  const [year, month] = mois.split("-").map(Number);
  // D15 : 404 si le rapport n'a pas été généré ou si le toggle portail est
  // désactivé pour ce client.
  const report = await getActivityReportForPortalUser(
    session.user.id,
    mois,
    new Date(Date.UTC(year, month - 1, 1)),
    new Date(Date.UTC(year, month, 1)),
  );
  if (!report) {
    return new NextResponse("Rapport indisponible", { status: 404 });
  }

  const periodLabel = new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(report.periodStart);

  const buffer = await renderActivityReportPdf(report, periodLabel);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="rapport-${mois}.pdf"`,
    },
  });
}
