"use client";

import { useState } from "react";
import { useActionState } from "react";

import { generateReportAction } from "@/lib/actions/reports";
import { formatDuration } from "@/lib/format";

export type PanelClient = {
  id: string;
  name: string;
  monthAgg: Record<string, { totalMs: number; taskCount: number; missionCount: number }>;
};

type Props = {
  clients: PanelClient[];
  months: { key: string; label: string }[];
  currentMonthLabel: string;
};

const FIELD =
  "w-full rounded-[10px] bg-paper px-4 py-3 text-[13px] font-medium text-ink outline-none transition focus:ring-2 focus:ring-ink/30";

// Panneau vedette « Nouveau rapport » (DESIGN-RAPPORTS.md §1) — aplat lilas,
// gabarit identique aux panneaux chrono/demande.
export default function GenerateReportPanel({ clients, months, currentMonthLabel }: Props) {
  const [clientId, setClientId] = useState(clients[0]?.id ?? "");
  const [month, setMonth] = useState(months[0]?.key ?? "");
  const [state, action, pending] = useActionState(generateReportAction, undefined);

  const agg = clients.find((client) => client.id === clientId)?.monthAgg[month];

  return (
    <form
      action={action}
      className="flex flex-col gap-4 rounded-[18px] bg-lilac p-6 shadow-sticker-strong"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-[19px] font-bold text-ink">Nouveau rapport</p>
        <span className="rotate-2 rounded-full bg-lime px-2.5 py-1 text-xs font-bold text-ink shadow-sticker">
          2 min chrono
        </span>
      </div>
      <h2 className="font-bowlby text-[30px] leading-tight text-ink">
        <span className="capitalize">{currentMonthLabel}</span>, prêt à partir.
      </h2>

      <label htmlFor="report-client" className="sr-only">
        Client
      </label>
      <select
        id="report-client"
        name="clientId"
        value={clientId}
        onChange={(event) => setClientId(event.target.value)}
        required
        className={FIELD}
      >
        {clients.map((client) => (
          <option key={client.id} value={client.id}>
            {client.name}
          </option>
        ))}
      </select>

      <label htmlFor="report-month" className="sr-only">
        Mois
      </label>
      <select
        id="report-month"
        name="month"
        value={month}
        onChange={(event) => setMonth(event.target.value)}
        required
        className={FIELD}
      >
        {months.map((option) => (
          <option key={option.key} value={option.key} className="capitalize">
            {option.label}
          </option>
        ))}
      </select>

      <div className="flex flex-col gap-1.5 text-[13px] font-medium text-ink">
        <div className="flex items-center justify-between gap-3">
          <span className="opacity-70">Temps tracké</span>
          <span className="font-bold">{agg ? formatDuration(agg.totalMs) : "—"}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="opacity-70">Tâches couvertes</span>
          <span className="font-bold">{agg ? agg.taskCount : "—"}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="opacity-70">Missions couvertes</span>
          <span className="font-bold">{agg ? agg.missionCount : "—"}</span>
        </div>
      </div>

      <div>
        <button
          disabled={pending || !agg}
          type="submit"
          className="w-full rounded-xl bg-orange px-5 py-3.5 text-sm font-bold text-ink shadow-sticker transition hover:brightness-95 disabled:opacity-60"
        >
          {pending ? "Génération…" : "▶ Générer le rapport"}
        </button>
        <p className="mt-2 text-center text-[11px] font-semibold text-ink opacity-70">
          PDF + version portail, en un clic
        </p>
      </div>

      {state?.error && <p className="text-xs font-semibold text-ink">{state.error}</p>}
      {state?.ok && (
        <p className="text-xs font-bold text-ink">
          Rapport généré ✓ — retrouve-le dans la carte du client.
        </p>
      )}
    </form>
  );
}
