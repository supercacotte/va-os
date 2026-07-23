import { Document, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";

import { formatDuration } from "@/lib/format";
import type { ActivityReport } from "@/lib/data/reports";

// Palette VA Desk (D14) — texte toujours ink, couleurs en accents/surfaces.
const INK = "#202221";
const ORANGE = "#fca049";
const FOND = "#ebeae5";
const MUTED = "#71716b";
const LINE = "#d9d7d0";

const styles = StyleSheet.create({
  page: { padding: 48, fontSize: 10, fontFamily: "Helvetica", color: INK },
  brand: { fontSize: 9, letterSpacing: 2, color: MUTED, textTransform: "uppercase" },
  title: { fontSize: 22, fontFamily: "Helvetica-Bold", marginTop: 6 },
  subtitle: { fontSize: 11, color: MUTED, marginTop: 4 },
  headerRule: { height: 3, backgroundColor: ORANGE, marginTop: 16, marginBottom: 24, width: 64 },
  missionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: FOND,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginTop: 12,
    borderRadius: 4,
  },
  missionName: { fontFamily: "Helvetica-Bold", fontSize: 11 },
  taskRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: LINE,
  },
  taskMeta: { color: MUTED },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: INK,
    borderRadius: 4,
  },
  totalText: { color: "#fbfbf9", fontFamily: "Helvetica-Bold", fontSize: 11 },
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

export async function renderActivityReportPdf(report: ActivityReport, periodLabel: string) {
  const vaName =
    [report.va.name, report.va.lastName].filter(Boolean).join(" ") || report.va.email;

  const doc = (
    <Document
      title={`Rapport d'activité — ${report.client.name} — ${periodLabel}`}
      author={vaName}
    >
      <Page size="A4" style={styles.page}>
        <Text style={styles.brand}>VA Desk</Text>
        <Text style={styles.title}>Rapport d&apos;activité</Text>
        <Text style={styles.subtitle}>
          {report.client.name}
          {report.client.company ? ` (${report.client.company})` : ""} — {periodLabel}
        </Text>
        <Text style={styles.subtitle}>Préparé par {vaName}</Text>
        <View style={styles.headerRule} />

        {report.missions.map((mission) => (
          <View key={mission.id} wrap={false}>
            <View style={styles.missionHeader}>
              <Text style={styles.missionName}>{mission.name}</Text>
              <Text style={styles.missionName}>{formatDuration(mission.totalMs)}</Text>
            </View>
            {mission.tasks.map((task) => (
              <View key={task.id} style={styles.taskRow}>
                <Text>
                  {task.title}{" "}
                  <Text style={styles.taskMeta}>
                    ({task.entryCount} entrée{task.entryCount > 1 ? "s" : ""})
                  </Text>
                </Text>
                <Text>{formatDuration(task.totalMs)}</Text>
              </View>
            ))}
          </View>
        ))}

        <View style={styles.totalRow}>
          <Text style={styles.totalText}>Total sur la période</Text>
          <Text style={styles.totalText}>{formatDuration(report.totalMs)}</Text>
        </View>

        <View style={styles.footer} fixed>
          <Text>Généré avec VA Desk — vadesk.fr</Text>
          <Text
            render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );

  return renderToBuffer(doc);
}
