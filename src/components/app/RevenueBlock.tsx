"use client";

import { useState } from "react";

import { clientColorVar } from "@/lib/client-colors";
import { formatDuration } from "@/lib/format";
import type { ClientRevenue, RevenueView } from "@/lib/data/revenue";

const euro2 = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const euro0 = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

function View({
  view,
  color,
  hourlyRate,
}: {
  view: RevenueView;
  color: number;
  hourlyRate: number;
}) {
  const maxAmount = Math.max(...view.bars.map((b) => b.amount), 1);
  const delta = view.featured.deltaPct;
  const periodShort = view.featured.label.split(" ")[0].toLowerCase();

  return (
    <>
      {/* Panneau vedette — couleur client */}
      <div
        className="mt-4 rounded-[18px] p-5 shadow-sticker"
        style={{ backgroundColor: clientColorVar(color) }}
      >
        <div className="flex items-start justify-between gap-2">
          <p className="font-bowlby text-[34px] leading-none text-ink">
            {euro2.format(view.featured.amount)}
          </p>
          {delta !== null && (
            <span
              className={`-rotate-2 shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold text-ink shadow-sticker ${
                delta >= 0 ? "bg-lime" : "bg-sand"
              }`}
            >
              {delta >= 0 ? "+" : ""}
              {delta} %
            </span>
          )}
        </div>
        <p className="mt-2 text-[12px] font-semibold text-ink opacity-70">
          {formatDuration(view.featured.ms)} × {hourlyRate} €/h — {periodShort}
        </p>

        {/* Mini-graphe */}
        <div className="mt-4 flex items-end justify-between gap-1.5">
          {view.bars.map((bar, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
              <div className="flex h-16 w-full items-end justify-center">
                <div
                  className={`w-full rounded-[6px] ${bar.isCurrent ? "bg-ink" : "bg-paper"}`}
                  style={{ height: `${Math.max((bar.amount / maxAmount) * 100, 8)}%` }}
                  title={euro0.format(bar.amount)}
                />
              </div>
              <span className="text-[10px] font-semibold text-ink opacity-70">{bar.label}</span>
            </div>
          ))}
        </div>

        {/* 2 stats en bas du panneau */}
        <div className="mt-4 flex flex-wrap items-baseline justify-between gap-2 border-t border-ink/15 pt-3">
          <p className="text-[12px] font-semibold text-ink">
            <span className="font-bold">{euro0.format(view.stats.sinceAmount)}</span>{" "}
            <span className="opacity-60">{view.stats.sinceLabel}</span>
          </p>
          <p className="text-[12px] font-semibold text-ink">
            <span className="font-bold">{formatDuration(view.stats.hoursMs)}</span>{" "}
            <span className="opacity-60">{view.stats.hoursLabel}</span>
          </p>
        </div>
      </div>
    </>
  );
}

// Bloc « Chiffre d'affaires » de la fiche client (maquette 33a) — compact,
// colonne de gauche. Le taux horaire se règle dans « Infos du client ».
export default function RevenueBlock({ revenue }: { revenue: ClientRevenue }) {
  const [mode, setMode] = useState<"mensuel" | "annuel">("mensuel");
  const view = mode === "mensuel" ? revenue.mensuel : revenue.annuel;

  return (
    <section className="rounded-[18px] bg-paper p-5 shadow-sticker ring-1 ring-ink/5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[13px] font-bold uppercase tracking-[1.5px] text-ink">
          Chiffre d&apos;affaires
        </h2>
        <div className="inline-flex items-center gap-1 rounded-full bg-sand p-1">
          {(
            [
              ["mensuel", "Mois"],
              ["annuel", "Année"],
            ] as const
          ).map(([m, label]) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition ${
                mode === m ? "bg-ink text-paper" : "text-ink/70 hover:text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {revenue.hourlyRate ? (
        <View view={view} color={revenue.color} hourlyRate={revenue.hourlyRate} />
      ) : (
        <div className="mt-4 rounded-[18px] border-2 border-dashed border-ink/30 p-6 text-center">
          <p className="text-[14px] font-bold text-ink">Renseigne le taux horaire →</p>
          <p className="mx-auto mt-2 max-w-xs text-[12px] font-medium text-ink opacity-60">
            Ajoute-le dans « Infos du client » ci-dessus : VA Desk estimera le CA à partir du
            temps tracké. Une estimation, jamais une facture.
          </p>
        </div>
      )}

      <p className="mt-4 text-[11px] font-medium leading-relaxed text-ink opacity-50">
        Estimation = temps tracké × taux horaire. Pas une facture, jamais montré au client.
      </p>
    </section>
  );
}
