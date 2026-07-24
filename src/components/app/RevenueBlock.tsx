"use client";

import { useState } from "react";
import { useActionState } from "react";

import { updateClientHourlyRate, type RateFormState } from "@/lib/actions/revenue";
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

function HourlyRateRow({
  clientId,
  clientName,
  hourlyRate,
}: {
  clientId: string;
  clientName: string;
  hourlyRate: number | null;
}) {
  const [editing, setEditing] = useState(false);
  const [state, action, pending] = useActionState<RateFormState, FormData>(
    async (prev, formData) => {
      const result = await updateClientHourlyRate(prev, formData);
      if (result?.ok) setEditing(false);
      return result;
    },
    undefined,
  );

  const firstName = clientName.split(" ")[0];

  if (editing) {
    return (
      <form action={action} className="flex flex-wrap items-center justify-between gap-3 rounded-[14px] bg-sand px-5 py-4">
        <input type="hidden" name="clientId" value={clientId} />
        <label htmlFor="hourlyRate" className="text-[14px] font-bold text-ink">
          Taux horaire de {firstName}
        </label>
        <div className="flex items-center gap-2">
          <input
            id="hourlyRate"
            name="hourlyRate"
            inputMode="numeric"
            autoFocus
            defaultValue={hourlyRate ?? ""}
            placeholder="45"
            className="w-20 rounded-[10px] bg-paper px-3 py-2 text-[14px] font-bold text-ink outline-none transition focus:ring-2 focus:ring-ink/30"
          />
          <span className="text-[13px] font-semibold text-ink opacity-60">€ / h</span>
          <button
            disabled={pending}
            type="submit"
            className="rounded-[10px] bg-ink px-3 py-2 text-[12px] font-bold text-paper transition hover:opacity-85 disabled:opacity-60"
          >
            OK
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="text-[12px] font-semibold text-ink opacity-60 transition hover:opacity-100"
          >
            annuler
          </button>
        </div>
        {state?.error && <p className="w-full text-xs font-semibold text-ink/70">{state.error}</p>}
      </form>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[14px] bg-sand px-5 py-4">
      <p className="text-[14px] font-bold text-ink">Taux horaire de {firstName}</p>
      <div className="flex items-center gap-4">
        {hourlyRate ? (
          <p className="text-[14px] font-bold text-ink">
            {hourlyRate} € <span className="font-semibold opacity-60">/ h</span>
          </p>
        ) : (
          <p className="text-[13px] font-semibold text-ink opacity-50">non renseigné</p>
        )}
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-[13px] font-bold text-ink underline decoration-orange decoration-2 underline-offset-4 transition hover:decoration-ink"
        >
          {hourlyRate ? "Modifier" : "Renseigner"}
        </button>
      </div>
    </div>
  );
}

function View({ view, color }: { view: RevenueView; color: number }) {
  const maxAmount = Math.max(...view.bars.map((b) => b.amount), 1);
  const delta = view.featured.deltaPct;

  return (
    <>
      {/* Panneau vedette — couleur client */}
      <div
        className="mt-4 rounded-[18px] p-6 shadow-sticker"
        style={{ backgroundColor: clientColorVar(color) }}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <p className="text-[15px] font-bold text-ink">{view.featured.label}</p>
          {delta !== null && (
            <span
              className={`-rotate-2 rounded-full px-2.5 py-1 text-[11px] font-bold text-ink shadow-sticker ${
                delta >= 0 ? "bg-lime" : "bg-sand"
              }`}
            >
              {delta >= 0 ? "+" : ""}
              {delta} % vs {view.featured.deltaLabel}
            </span>
          )}
        </div>
        <p className="mt-2 font-bowlby text-[44px] leading-none text-ink">
          {euro2.format(view.featured.amount)}
        </p>
        <p className="mt-2 text-[13px] font-semibold text-ink opacity-70">
          {formatDuration(view.featured.ms)} trackées
        </p>

        {/* Mini-graphe */}
        <div className="mt-6 flex items-end justify-between gap-2 border-t border-ink/15 pt-5">
          {view.bars.map((bar, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex h-24 w-full items-end justify-center">
                <div
                  className={`w-full rounded-[8px] ${bar.isCurrent ? "bg-ink" : "bg-paper"}`}
                  style={{ height: `${Math.max((bar.amount / maxAmount) * 100, 6)}%` }}
                  title={euro0.format(bar.amount)}
                />
              </div>
              <span className="text-[11px] font-semibold text-ink opacity-70">{bar.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3 stats */}
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-[16px] bg-sand p-5 text-center">
          <p className="font-bowlby text-[24px] leading-none text-ink">
            {euro0.format(view.stats.sinceAmount)}
          </p>
          <p className="mt-1.5 text-[12px] font-semibold text-ink opacity-60">
            {view.stats.sinceLabel}
          </p>
        </div>
        <div className="rounded-[16px] bg-sand p-5 text-center">
          <p className="font-bowlby text-[24px] leading-none text-ink">
            {formatDuration(view.stats.hoursMs)}
          </p>
          <p className="mt-1.5 text-[12px] font-semibold text-ink opacity-60">
            {view.stats.hoursLabel}
          </p>
        </div>
        <div className="rounded-[16px] bg-sand p-5 text-center">
          <p className="font-bowlby text-[24px] leading-none text-ink">
            {euro0.format(view.stats.avgAmount)}
          </p>
          <p className="mt-1.5 text-[12px] font-semibold text-ink opacity-60">
            {view.stats.avgLabel}
          </p>
        </div>
      </div>
    </>
  );
}

// Bloc « Chiffre d'affaires » de la fiche client (maquette 32a).
export default function RevenueBlock({
  clientId,
  revenue,
}: {
  clientId: string;
  revenue: ClientRevenue;
}) {
  const [mode, setMode] = useState<"mensuel" | "annuel">("mensuel");
  const view = mode === "mensuel" ? revenue.mensuel : revenue.annuel;

  return (
    <section className="rounded-[18px] bg-paper p-6 shadow-sticker ring-1 ring-ink/5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[13px] font-bold uppercase tracking-[1.5px] text-ink">
          Chiffre d&apos;affaires
        </h2>
        <div className="inline-flex items-center gap-1 rounded-full bg-sand p-1">
          {(["mensuel", "annuel"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`rounded-full px-4 py-1.5 text-[13px] font-semibold capitalize transition ${
                mode === m ? "bg-ink text-paper" : "text-ink/70 hover:text-ink"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <HourlyRateRow
          clientId={clientId}
          clientName={revenue.clientName}
          hourlyRate={revenue.hourlyRate}
        />
      </div>

      {revenue.hourlyRate ? (
        <View view={view} color={revenue.color} />
      ) : (
        <div className="mt-4 rounded-[18px] border-2 border-dashed border-ink/30 p-8 text-center">
          <p className="text-[15px] font-bold text-ink">Renseigne ton taux horaire →</p>
          <p className="mx-auto mt-2 max-w-md text-[13px] font-medium text-ink opacity-60">
            Dès que tu indiques un taux, VA Desk estime le chiffre d&apos;affaires de ce
            client à partir du temps tracké. C&apos;est une estimation, jamais une facture.
          </p>
        </div>
      )}

      <p className="mt-4 text-[11px] font-medium leading-relaxed text-ink opacity-50">
        Estimation calculée sur le temps tracké × le taux horaire de la fiche — ce n&apos;est
        pas une facture, et ce n&apos;est jamais montré à ton client.
      </p>
    </section>
  );
}
