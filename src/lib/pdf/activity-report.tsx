import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  Document,
  Font,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";

import { formatDuration } from "@/lib/format";
import type { ActivityReport } from "@/lib/data/reports";
import {
  BOWLBY_ONE_TTF_BASE64,
  INSTRUMENT_400_TTF_BASE64,
  INSTRUMENT_600_TTF_BASE64,
  INSTRUMENT_700_TTF_BASE64,
} from "@/lib/pdf/fonts";

// Document 16c « Ink + orange » (design/DESIGN-RAPPORTS.md §2) :
// monochrome ink, un seul accent orange, pas de couleur client.
// Cotes de la maquette en px (A4 = 794 px) converties en pt (×0.75).
const INK = "#202221";
const PAPER = "#fbfbf9";
const ORANGE = "#fca049";
const INK_70 = "rgba(32, 34, 33, 0.7)";
const INK_60 = "rgba(32, 34, 33, 0.6)";
const HAIRLINE = "rgba(32, 34, 33, 0.07)";

// react-pdf lit les polices depuis un chemin : on matérialise les TTF
// embarqués (base64) dans le tmpdir une seule fois par process.
let fontsRegistered = false;
function registerFonts() {
  if (fontsRegistered) return;
  const dir = mkdtempSync(path.join(tmpdir(), "vadesk-fonts-"));
  const write = (name: string, base64: string) => {
    const file = path.join(dir, name);
    writeFileSync(file, Buffer.from(base64, "base64"));
    return file;
  };

  Font.register({
    family: "Bowlby One",
    src: write("bowlby.ttf", BOWLBY_ONE_TTF_BASE64),
  });
  Font.register({
    family: "Instrument Sans",
    fonts: [
      { src: write("instrument-400.ttf", INSTRUMENT_400_TTF_BASE64), fontWeight: 400 },
      { src: write("instrument-600.ttf", INSTRUMENT_600_TTF_BASE64), fontWeight: 600 },
      { src: write("instrument-700.ttf", INSTRUMENT_700_TTF_BASE64), fontWeight: 700 },
    ],
  });
  fontsRegistered = true;
}

const styles = StyleSheet.create({
  page: {
    paddingVertical: 42,
    paddingHorizontal: 48,
    fontSize: 9.75,
    fontFamily: "Instrument Sans",
    color: INK,
    backgroundColor: PAPER,
  },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  kicker: {
    fontSize: 8.25,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    fontWeight: 700,
  },
  sticker: {
    backgroundColor: ORANGE,
    borderRadius: 6,
    paddingVertical: 5,
    paddingHorizontal: 10,
    transform: "rotate(-2deg)",
  },
  stickerText: { fontSize: 9, fontFamily: "Bowlby One", letterSpacing: 1, color: INK },
  clientName: { fontSize: 22.5, fontFamily: "Bowlby One", marginTop: 8 },
  subtitle: { fontSize: 10.5, color: INK_70, marginTop: 4 },
  rule: { height: 2.25, backgroundColor: INK, marginTop: 14, marginBottom: 18 },
  statsBox: {
    flexDirection: "row",
    borderWidth: 0.75,
    borderColor: INK,
    borderRadius: 9,
    marginBottom: 18,
  },
  statCell: { flex: 1, paddingVertical: 11, paddingHorizontal: 13 },
  statCellDivider: { borderLeftWidth: 0.75, borderLeftColor: INK },
  statValue: { fontSize: 16.5, fontFamily: "Bowlby One" },
  statLabel: {
    fontSize: 8.25,
    letterSpacing: 1,
    color: INK_60,
    textTransform: "uppercase",
    fontWeight: 700,
    marginTop: 4,
  },
  missionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderBottomWidth: 1.5,
    borderBottomColor: INK,
    paddingBottom: 5,
    marginTop: 14,
  },
  missionName: { fontSize: 12, fontWeight: 700 },
  missionTotalWrap: { borderBottomWidth: 2.25, borderBottomColor: ORANGE, paddingBottom: 1 },
  missionTotal: { fontSize: 10.5, fontWeight: 700 },
  entryRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6.5,
    borderBottomWidth: 0.75,
    borderBottomColor: HAIRLINE,
  },
  entryDate: { width: 67, fontSize: 9.75, color: INK_70 },
  entryTitle: { flex: 1, fontSize: 9.75 },
  entryDuration: { width: 67, fontSize: 9.75, fontWeight: 600, textAlign: "right" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 22,
    paddingVertical: 11,
    paddingHorizontal: 15,
    backgroundColor: ORANGE,
    borderRadius: 9,
  },
  totalLabel: { fontSize: 10.5, fontWeight: 700 },
  totalValue: { fontSize: 15, fontFamily: "Bowlby One" },
  footer: {
    position: "absolute",
    bottom: 28,
    left: 48,
    right: 48,
    borderTopWidth: 0.75,
    borderTopColor: "rgba(32, 34, 33, 0.15)",
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8.25,
    color: INK_70,
  },
});

const entryDateFormat = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  timeZone: "UTC",
});

export async function renderActivityReportPdf(report: ActivityReport, periodLabel: string) {
  registerFonts();

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
          <View key={mission.id}>
            {/* Une mission ne se coupe pas entre son titre et sa 1re entrée */}
            <View style={styles.missionHeader} minPresenceAhead={40}>
              <Text style={styles.missionName}>{mission.name}</Text>
              <View style={styles.missionTotalWrap}>
                <Text style={styles.missionTotal}>{formatDuration(mission.totalMs)}</Text>
              </View>
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

        <View style={styles.totalRow} wrap={false}>
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
