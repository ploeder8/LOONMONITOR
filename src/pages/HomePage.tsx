import { useMemo, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { Banner } from "@/components/Banner";
import { ResultCard } from "@/components/ResultCard";
import { FormField, inputClass, selectClass } from "@/components/Field";
import { AuditPanel } from "@/components/AuditPanel";
import { brutolocheck, lookupBarema, lookupStudentenbarema } from "@/lib/baremas";
import type { BaremaCat, Schaal, StudentenCat } from "@/lib/baremas";
import { rszBijdragen } from "@/lib/rsz";
import { eindejaarspremie } from "@/lib/eindejaarspremie";
import { ecocheques } from "@/lib/ecocheques";
import {
  fietsvergoeding,
  FIETSVERGOEDING_HISTORISCHE_BANNER,
} from "@/lib/fietsvergoeding";
import { woonwerkTrein } from "@/lib/woonwerkTrein";
import { jaarlijksePremie2026 } from "@/lib/jaarpremie";
import { indexeerLoon } from "@/lib/indexatie";
import {
  BaremaBuitenSchaalError,
  DatapuntNietBruikbaar,
  DatapuntNietGeldigOpDatum,
  PC200DatasetError,
} from "@/lib/errors";
import { formatEUR } from "@/lib/money";

type Modus = "bediende" | "student";

interface Profiel {
  modus: Modus;
  schaal: Schaal;
  cat: BaremaCat;
  ervaringJaren: number;
  studentenCat: StudentenCat;
  studentLeeftijd: number;
  brutoloon: number;
  bouwVlag: boolean;
  refDatum: string;
  // Eindejaarspremie
  ancienniteitMaanden: number;
  prestatieMaanden: number;
  // Ecocheques
  tewerkstellingsbreuk: number;
  // Fietsvergoeding
  kmPerDag: number;
  arbeidsdagenPerMaand: number;
  // Woon-werk
  treinkaartPrijs: number;
  // Indexatie
  oudLoon: number;
}

const DEFAULTS: Profiel = {
  modus: "bediende",
  schaal: "I",
  cat: "A",
  ervaringJaren: 5,
  studentenCat: "A",
  studentLeeftijd: 17,
  brutoloon: 2276.51,
  bouwVlag: false,
  refDatum: "2026-06-01",
  ancienniteitMaanden: 12,
  prestatieMaanden: 12,
  tewerkstellingsbreuk: 1,
  kmPerDag: 8,
  arbeidsdagenPerMaand: 22,
  treinkaartPrijs: 92,
  oudLoon: 3500,
};

export function HomePage() {
  const [p, setP] = useState<Profiel>(DEFAULTS);

  function set<K extends keyof Profiel>(k: K, v: Profiel[K]) {
    setP((prev) => ({ ...prev, [k]: v }));
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[400px_1fr]">
      <ProfileForm profiel={p} set={set} />
      <ErrorBoundary
        fallbackRender={({ error, resetErrorBoundary }) => (
          <Banner kind="error" title="Onverwachte fout">
            <p>{(error as Error).message}</p>
            <button
              onClick={resetErrorBoundary}
              className="mt-2 rounded bg-rose-200 px-3 py-1 text-xs"
            >
              Opnieuw proberen
            </button>
          </Banner>
        )}
        resetKeys={[JSON.stringify(p)]}
      >
        <ResultsPanel profiel={p} />
      </ErrorBoundary>
    </div>
  );
}

function ProfileForm({
  profiel,
  set,
}: {
  profiel: Profiel;
  set: <K extends keyof Profiel>(k: K, v: Profiel[K]) => void;
}) {
  return (
    <aside className="flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold">Profiel</h2>

      <FormField label="Modus">
        <select
          className={selectClass}
          value={profiel.modus}
          onChange={(e) => set("modus", e.target.value as Modus)}
        >
          <option value="bediende">Bediende (Schaal I/II)</option>
          <option value="student">Student</option>
        </select>
      </FormField>

      <FormField label="Referentiedatum">
        <input
          className={inputClass}
          type="date"
          value={profiel.refDatum}
          onChange={(e) => set("refDatum", e.target.value)}
        />
      </FormField>

      {profiel.modus === "bediende" ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Schaal">
              <select
                className={selectClass}
                value={profiel.schaal}
                onChange={(e) => set("schaal", e.target.value as Schaal)}
              >
                <option value="I">I</option>
                <option value="II">II</option>
              </select>
            </FormField>
            <FormField label="Categorie">
              <select
                className={selectClass}
                value={profiel.cat}
                onChange={(e) => set("cat", e.target.value as BaremaCat)}
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
            </FormField>
          </div>

          <FormField label="Ervaring (jaren)">
            <input
              className={inputClass}
              type="number"
              min={0}
              max={60}
              value={profiel.ervaringJaren}
              onChange={(e) => set("ervaringJaren", parseInt(e.target.value || "0", 10))}
            />
          </FormField>

          <FormField label="Brutoloon (€)">
            <input
              className={inputClass}
              type="number"
              step="0.01"
              value={profiel.brutoloon}
              onChange={(e) => set("brutoloon", parseFloat(e.target.value || "0"))}
            />
          </FormField>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={profiel.bouwVlag}
              onChange={(e) => set("bouwVlag", e.target.checked)}
            />
            Bouw-subset (extra 1,80 % aanvullend pensioen)
          </label>
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Categorie">
              <select
                className={selectClass}
                value={profiel.studentenCat}
                onChange={(e) =>
                  set("studentenCat", e.target.value as StudentenCat)
                }
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
            </FormField>
            <FormField label="Leeftijd">
              <input
                className={inputClass}
                type="number"
                min={14}
                max={30}
                value={profiel.studentLeeftijd}
                onChange={(e) =>
                  set("studentLeeftijd", parseInt(e.target.value || "0", 10))
                }
              />
            </FormField>
          </div>
        </>
      )}

      <hr className="border-zinc-200" />
      <h3 className="text-sm font-semibold text-zinc-700">Eindejaarspremie</h3>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Anciënniteit (mnd)">
          <input
            className={inputClass}
            type="number"
            min={0}
            value={profiel.ancienniteitMaanden}
            onChange={(e) =>
              set("ancienniteitMaanden", parseInt(e.target.value || "0", 10))
            }
          />
        </FormField>
        <FormField label="Prestatie-maanden">
          <input
            className={inputClass}
            type="number"
            min={0}
            max={12}
            value={profiel.prestatieMaanden}
            onChange={(e) =>
              set("prestatieMaanden", parseInt(e.target.value || "0", 10))
            }
          />
        </FormField>
      </div>

      <hr className="border-zinc-200" />
      <h3 className="text-sm font-semibold text-zinc-700">Ecocheques</h3>
      <FormField label="Tewerkstellingsbreuk (0 – 1)">
        <input
          className={inputClass}
          type="number"
          step="0.1"
          min={0}
          max={1}
          value={profiel.tewerkstellingsbreuk}
          onChange={(e) =>
            set("tewerkstellingsbreuk", parseFloat(e.target.value || "0"))
          }
        />
      </FormField>

      <hr className="border-zinc-200" />
      <h3 className="text-sm font-semibold text-zinc-700">Fietsvergoeding</h3>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Km per dag">
          <input
            className={inputClass}
            type="number"
            min={0}
            value={profiel.kmPerDag}
            onChange={(e) => set("kmPerDag", parseFloat(e.target.value || "0"))}
          />
        </FormField>
        <FormField label="Arbeidsdagen / maand">
          <input
            className={inputClass}
            type="number"
            min={0}
            max={31}
            value={profiel.arbeidsdagenPerMaand}
            onChange={(e) =>
              set("arbeidsdagenPerMaand", parseInt(e.target.value || "0", 10))
            }
          />
        </FormField>
      </div>

      <hr className="border-zinc-200" />
      <h3 className="text-sm font-semibold text-zinc-700">Woon-werk trein</h3>
      <FormField label="Treinkaart 2e klasse / maand (€)">
        <input
          className={inputClass}
          type="number"
          step="0.01"
          min={0}
          value={profiel.treinkaartPrijs}
          onChange={(e) =>
            set("treinkaartPrijs", parseFloat(e.target.value || "0"))
          }
        />
      </FormField>

      <hr className="border-zinc-200" />
      <h3 className="text-sm font-semibold text-zinc-700">Indexatie</h3>
      <FormField label="Loon op 31/12/2025 (€)">
        <input
          className={inputClass}
          type="number"
          step="0.01"
          min={0}
          value={profiel.oudLoon}
          onChange={(e) => set("oudLoon", parseFloat(e.target.value || "0"))}
        />
      </FormField>
    </aside>
  );
}

function ResultsPanel({ profiel }: { profiel: Profiel }) {
  const blocks = useMemo(() => bouwResultaten(profiel), [profiel]);

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-base font-semibold">Resultaten</h2>
      {blocks.map((b, i) => (
        <div key={i}>{b}</div>
      ))}
    </section>
  );
}

function safeRender<T>(fn: () => T, render: (r: T) => React.ReactNode): React.ReactNode {
  try {
    return render(fn());
  } catch (e) {
    if (e instanceof DatapuntNietGeldigOpDatum) {
      return (
        <Banner kind="warning" title="Datapunt niet geldig op deze datum">
          <p>{e.message}</p>
        </Banner>
      );
    }
    if (e instanceof DatapuntNietBruikbaar) {
      return (
        <Banner kind="warning" title="Datapunt niet bruikbaar">
          <p>{e.message}</p>
        </Banner>
      );
    }
    if (e instanceof BaremaBuitenSchaalError) {
      return (
        <Banner kind="error" title="Barema-fout">
          <p>{e.message}</p>
        </Banner>
      );
    }
    if (e instanceof PC200DatasetError) {
      return (
        <Banner kind="error" title="Dataset-fout">
          <p>{e.message}</p>
        </Banner>
      );
    }
    return (
      <Banner kind="error" title="Onverwachte fout">
        <p>{(e as Error).message}</p>
      </Banner>
    );
  }
}

function bouwResultaten(p: Profiel): React.ReactNode[] {
  const out: React.ReactNode[] = [];

  // 1. Barema + bruto-check
  if (p.modus === "bediende") {
    out.push(
      safeRender(
        () => {
          const r = lookupBarema(p.schaal, p.cat, p.ervaringJaren);
          const c = brutolocheck(p.schaal, p.cat, p.ervaringJaren, p.brutoloon);
          return { r, c };
        },
        ({ r, c }) => (
          <>
            <ResultCard
              label={`Sectoraal minimum — Schaal ${p.schaal}, Cat ${p.cat}, ${r.effectieveErvaring} jaar`}
              amountEUR={r.maandloonEUR}
              helper={
                r.geclampt
                  ? `Loonplafond bereikt — ervaring ${p.ervaringJaren} > ${r.effectieveErvaring}`
                  : undefined
              }
              datapunten={[r.datapunt]}
              highlight
            />
            {c.ok ? (
              <Banner kind="success" title="Brutoloon-check OK">
                Opgegeven brutoloon ≥ sectoraal minimum (verschil {formatEUR(c.verschil)}).
              </Banner>
            ) : (
              <Banner kind="error" title="Brutoloon onder sectoraal minimum">
                Verschil: {formatEUR(c.verschil)}. Pas het loon aan of controleer schaal/cat/ervaring.
              </Banner>
            )}
          </>
        ),
      ),
    );
  } else {
    out.push(
      safeRender(
        () => lookupStudentenbarema(p.studentenCat, p.studentLeeftijd),
        (r) => (
          <ResultCard
            label={`Studentenbarema — Cat ${p.studentenCat}, ${p.studentLeeftijd} jaar`}
            amountEUR={r.maandloonEUR}
            datapunten={[r.datapunt]}
            highlight
          />
        ),
      ),
    );
  }

  if (p.modus === "bediende") {
    // 2. RSZ
    out.push(
      safeRender(
        () => rszBijdragen({ brutoloon: p.brutoloon, refDatum: p.refDatum, bouwVlag: p.bouwVlag }),
        (r) => (
          <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="mb-2 text-sm font-medium text-zinc-700">
              RSZ-bijdragen (op € {p.brutoloon.toFixed(2)})
            </div>
            <table className="w-full border-collapse text-sm">
              <tbody>
                {r.bronnen.map((b) => (
                  <tr key={b.datapunt.id} className="border-b border-zinc-100 last:border-0">
                    <td className="py-2 pr-2 text-zinc-700">{b.label}</td>
                    <td className="py-2 pr-2 text-right tabular-nums font-semibold">
                      {formatEUR(b.bedrag)}
                    </td>
                  </tr>
                ))}
                <tr className="border-t-2 border-zinc-300 font-semibold">
                  <td className="py-2 pr-2">Totaal werkgeversbijdrage</td>
                  <td className="py-2 pr-2 text-right tabular-nums text-blue-800">
                    {formatEUR(r.totaalWerkgever)}
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="mt-3 flex flex-col gap-1">
              {r.bronnen.map((b) => (
                <div key={b.datapunt.id}>
                  <details className="text-xs">
                    <summary className="cursor-pointer font-mono text-zinc-600">
                      {b.datapunt.id}
                    </summary>
                    <div className="mt-1">
                      <AuditPanel datapunt={b.datapunt} />
                    </div>
                  </details>
                </div>
              ))}
            </div>
          </div>
        ),
      ),
    );

    // 3. Eindejaarspremie
    out.push(
      safeRender(
        () =>
          eindejaarspremie({
            brutoloon: p.brutoloon,
            ancienniteitMaanden: p.ancienniteitMaanden,
            prestatieMaandenInRefertepériode: p.prestatieMaanden,
          }),
        (r) => (
          <ResultCard
            label="Eindejaarspremie (pro-rata)"
            amountEUR={r.premie}
            helper={r.toelichting}
            datapunten={[r.datapunt]}
          />
        ),
      ),
    );
  }

  // 4. Ecocheques
  out.push(
    safeRender(
      () =>
        ecocheques({
          tewerkstellingsbreuk: p.tewerkstellingsbreuk,
          refDatum: p.refDatum,
        }),
      (r) => (
        <ResultCard
          label={`Ecocheques (${r.schaalLabel})`}
          amountEUR={r.bedrag}
          datapunten={[r.datapunt]}
        />
      ),
    ),
  );

  // 5. Jaarlijkse premie
  out.push(
    safeRender(
      () => jaarlijksePremie2026(p.refDatum),
      (r) => (
        <ResultCard
          label="Jaarlijkse premie 2026"
          amountEUR={r.bedrag}
          datapunten={[r.datapunt]}
        />
      ),
    ),
  );

  // 6. Woon-werk trein
  out.push(
    safeRender(
      () =>
        woonwerkTrein({
          treinkaartPrijsPerMaand: p.treinkaartPrijs,
          refDatum: p.refDatum,
        }),
      (r) => (
        <ResultCard
          label={`Woon-werk trein (${(r.fractie * 100).toFixed(0)} %)`}
          amountEUR={r.werkgeverstussenkomst}
          datapunten={[r.datapunt]}
        />
      ),
    ),
  );

  // 7. Fietsvergoeding — show banner about historic tariff for pre-1/10/2026 dates
  if (p.refDatum < "2026-10-01") {
    out.push(
      <Banner kind="info" title="Fietsvergoeding — historisch tarief">
        {FIETSVERGOEDING_HISTORISCHE_BANNER}
      </Banner>,
    );
  }
  out.push(
    safeRender(
      () =>
        fietsvergoeding({
          kmPerDag: p.kmPerDag,
          arbeidsdagen: p.arbeidsdagenPerMaand,
          refDatum: p.refDatum,
        }),
      (r) => (
        <ResultCard
          label={`Fietsvergoeding (€ ${r.tariefPerKm.toFixed(2)} / km × ${p.kmPerDag} km × ${p.arbeidsdagenPerMaand} dagen)`}
          amountEUR={r.vergoeding}
          datapunten={[r.datapunt]}
        />
      ),
    ),
  );

  // 8. Indexatie
  out.push(
    safeRender(
      () => indexeerLoon({ oudLoon: p.oudLoon, refDatum: p.refDatum }),
      (r) => (
        <ResultCard
          label={`Indexatie ondernemingsloon (× ${r.coefficient})`}
          amountEUR={r.nieuwLoon}
          helper={`Oud loon: ${formatEUR(r.oudLoon)} × ${r.coefficient}`}
          datapunten={[r.datapunt]}
        />
      ),
    ),
  );

  return out;
}

