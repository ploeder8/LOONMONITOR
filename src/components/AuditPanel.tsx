import { useState } from "react";
import type { Datapunt } from "@/types/dataset";
import { StatusBadge, TierBadge } from "@/components/StatusBadge";
import { BronLink } from "@/components/BronLink";

export function AuditPanel({ datapunt }: { datapunt: Datapunt }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-md border border-zinc-200 bg-zinc-50 text-sm">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left hover:bg-zinc-100"
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-zinc-700">{datapunt.id}</span>
          <StatusBadge status={datapunt.status} />
          {datapunt.betrouwbaarheid && <TierBadge tier={datapunt.betrouwbaarheid} />}
        </div>
        <span className="text-xs text-zinc-500">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="space-y-3 border-t border-zinc-200 px-3 py-3">
          <Field label="Omschrijving">{datapunt.omschrijving}</Field>

          {datapunt.waarde_bron != null && (
            <Field label="Waarde (letterlijk uit bron)">
              <code className="rounded bg-zinc-200 px-1 py-0.5 text-xs">
                {datapunt.waarde_bron}
              </code>
            </Field>
          )}

          {datapunt.waarde_genormaliseerd != null && (
            <Field label="Waarde (genormaliseerd)">
              <code className="rounded bg-zinc-200 px-1 py-0.5 text-xs">
                {datapunt.waarde_genormaliseerd}
              </code>
            </Field>
          )}

          {(datapunt.geldig_vanaf || datapunt.geldig_tot) && (
            <Field label="Geldigheid">
              {datapunt.geldig_vanaf ?? "—"} → {datapunt.geldig_tot ?? "open"}
            </Field>
          )}

          <Field label="Primaire bron">
            <div className="flex flex-col gap-0.5">
              <span>
                {datapunt.bron_organisatie ?? "—"}
                {datapunt.bron_titel ? ` — ${datapunt.bron_titel}` : ""}
              </span>
              <BronLink datapunt={datapunt} />
            </div>
          </Field>

          {datapunt.bron_fragment && (
            <Field label="Bron-citaat">
              <blockquote className="border-l-2 border-zinc-400 pl-3 text-xs italic text-zinc-700">
                {datapunt.bron_fragment}
              </blockquote>
            </Field>
          )}

          {datapunt.triangulatie_bronnen && datapunt.triangulatie_bronnen.length > 0 && (
            <Field label="Triangulatie-bronnen">
              <ul className="list-disc pl-5 text-xs text-zinc-700">
                {datapunt.triangulatie_bronnen.map((t, i) => (
                  <li key={i}>
                    {t.bron} ({t.tier}
                    {t.overeenstemming ? ` — ${t.overeenstemming}` : ""})
                    {t.url && (
                      <>
                        {" "}
                        <a
                          href={t.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-700 underline"
                        >
                          ↗
                        </a>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </Field>
          )}

          {datapunt.opmerkingen && datapunt.opmerkingen.length > 0 && (
            <Field label="Opmerkingen">
              <ul className="list-disc pl-5 text-xs text-zinc-700">
                {datapunt.opmerkingen.map((o, i) => (
                  <li key={i}>{o}</li>
                ))}
              </ul>
            </Field>
          )}

          {datapunt.conflict_opmerking && (
            <Field label="Bronconflict">
              <span className="text-rose-700">{datapunt.conflict_opmerking}</span>
            </Field>
          )}
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {label}
      </div>
      <div className="mt-0.5 text-sm text-zinc-900">{children}</div>
    </div>
  );
}
