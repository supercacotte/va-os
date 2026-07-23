import { Document, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";

import { formatDuration } from "@/lib/format";
import type { ActivityReport } from "@/lib/data/reports";

// PDF fidèle à design/maquette-rapport-pdf.png : header caps + sticker
// VA DESK orange penché, bandeau de stats encadré, lignes datées par entrée,
// total sur bandeau orange. Polices Helvetica en attendant l'embarquement
// des TTF de marque.
const INK = "#202221";
const PAPER = "#fbfbf9";
const ORANGE = "#fca049";
const MUTED = "#71716b";
const LINE = "rgba(32, 34, 33, 0.15)";

const styles = StyleSheet.create({
  page: { padding: 48, fontSize: 10, fontFamily: "Helvetica", color: INK, backgroundColor: PAPER },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  kicker: { fontSize: 9, letterSpacing: 2, color: INK, textTransform: "uppercase", fontFamily: "Helvetica-Bold" },
  sticker: {
    backgroundColor: ORANGE,
    borderRadius: 6,
    paddingVertical: 5,
    paddingHorizontal: 10,
    transform: "rotate(3deg)",
  },
  stickerText: { fontSize: 10, fontFamily: "Helvetica-Bold", letterSpacing: 1, color: INK },
  clientName: { fontSize: 26, fontFamily: "Helvetica-Bold", marginTop: 8 },
  subtitle: { fontSize: 10, color: MUTED, marginTop: 4 },
  rule: { height: 3, backgroundColor: INK, marginTop: 16, marginBottom: 20 },
  statsBox: {
    flexDirection: "row",
    borderWidth: 1.5,
    borderColor: INK,
    borderRadius: 8,
    marginBottom: 20,
  },
  statCell: { flex: 1, paddingVertical: 12, paddingHorizontal: 14 },
  statCellDivider: { borderLeftWidth: 1.5, borderLeftColor: INK },
  statValue: { fontSize: 16, fontFamily: "Helvetica-Bold" },
  statLabel: { fontSize: 7.5, letterSpacing: 1, color: MUTED, textTransform: "uppercase", marginTop: 3 },
  missionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 14,
    marginBottom: 4,
  },
  missionName: { fontSize: 12, fontFamily: "Helvetica-Bold" },
  missionTotal: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    borderBottomWidth: 2,
    borderBottomColor: ORANGE,
    paddingBottom: 2,
  },
  entryRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 7,
    borderBottomWidth: 0.5,
    borderBottomColor: LINE,
  },
  entryDate: { width: 52, fontSize: 9, color: MUTED },
  entryTitle: { flex: 1, fontSize: 10 },
  entryDuration: { fontSize: 10, fontFamily: "Helvetica-Bold" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: ORANGE,
    borderRadius: 8,
  },
  totalLabel: { fontSize: 11, fontFamily: "Helvetica-Bold" },
  totalValue: { fontSize: 16, fontFamily: "Helvetica-Bold" },
  footer: {
    position: "absolute",
    bottom: 32,
    left: 48,
    right: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: MUTED,
  },
});

const entryDateFormat = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  timeZone: "UTC",
});

export async function renderActivityReportPdf(report: ActivityReport, periodLabel: string) {
  const vaName =
    [report.va.name, report.va.lastName].filter(Boolean).join(" ") || report.va.email;

  const doc = (
    <Document
      title={`Rapport d'activité — ${report.client.name} — ${periodLabel}`}
      author={vaName}
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <Text style={styles.kicker}>Rapport d&apos;activité · {periodLabel}</Text>
          <View style={styles.sticker}>
            <Text style={styles.stickerText}>VA DESK</Text>
          </View>
        </View>
        <Text style={styles.clientName}>{report.client.name}</Text>
        <Text style={styles.subtitle}>
          {report.client.company ? `${report.client.company} · ` : ""}préparé par {vaName}
        </Text>
        <View style={styles.rule} />

        <View style={styles.statsBox}>
          <View style={styles.statCell}>
            <Text style={styles.statValue}>{formatDuration(report.totalMs)}</Text>
            <Text style={styles.statLabel}>Temps total</Text>
          </View>
          <View style={[styles.statCell, styles.statCellDivider]}>
            <Text style={styles.statValue}>{report.missions.length}</Text>
            <Text style={styles.statLabel}>
              Mission{report.missions.length > 1 ? "s" : ""}
            </Text>
          </View>
          <View style={[styles.statCell, styles.statCellDivider]}>
            <Text style={styles.statValue}>{report.coveredTaskCount}</Text>
            <Text style={styles.statLabel}>
              Tâche{report.coveredTaskCount > 1 ? "s" : ""} couverte
              {report.coveredTaskCount > 1 ? "s" : ""}
            </Text>
          </View>
        </View>

        {report.missions.map((mission) => (
          <View key={mission.id} wrap={false}>
            <View style={styles.missionHeader}>
              <Text style={styles.missionName}>{mission.name}</Text>
              <Text style={styles.missionTotal}>{formatDuration(mission.totalMs)}</Text>
            </View>
            {mission.entries.map((entry) => (
              <View key={entry.id} style={styles.entryRow}>
                <Text style={styles.entryDate}>{entryDateFormat.format(entry.startedAt)}</Text>
                <Text style={styles.entryTitle}>{entry.label ?? entry.taskTitle}</Text>
                <Text style={styles.entryDuration}>{formatDuration(entry.durationMs)}</Text>
              </View>
            ))}
          </View>
        ))}

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total sur la période</Text>
          <Text style={styles.totalValue}>{formatDuration(report.totalMs)}</Text>
        </View>

        <View style={styles.footer} fixed>
          <Text>Généré avec VA Desk — vadesk.fr</Text>
          <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );

  return renderToBuffer(doc);
}
