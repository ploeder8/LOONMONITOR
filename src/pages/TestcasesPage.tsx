import { ResultCard } from "@/components/ResultCard";
import { Banner } from "@/components/Banner";
import { lookupBarema, lookupStudentenbarema, brutolocheck } from "@/lib/baremas";
import { rszBijdragen } from "@/lib/rsz";
import { eindejaarspremie } from "@/lib/eindejaarspremie";
import { ecocheques } from "@/lib/ecocheques";
import { fietsvergoeding } from "@/lib/fietsvergoeding";
import { woonwerkTrein } from "@/lib/woonwerkTrein";
import { jaarlijksePremie2026 } from "@/lib/jaarpremie";
import { indexeerLoon } from "@/lib/indexatie";
import { formatEUR } from "@/lib/money";

interface TC {
  id: string;
  titel: string;
  toelichting: string;
  render: () => React.ReactNode;
}

const TESTCASES: TC[] = [
  {
    id: "TC-01",
    titel: "Schaal I, Cat A, 0 jaar",
    toelichting: "Sectoraal startloon — geen ervaringstoeslag.",
    render: () => {
      const r = lookupBarema("I", "A", 0);
      return (
        <ResultCard
          label="Schaal I — Cat A — 0 j"
          amountEUR={r.maandloonEUR}
          datapunten={[r.datapunt]}
          highlight
        />
      );
    },
  },
  {
    id: "TC-02",
    titel: "Schaal I, Cat A, 5 jaar",
    toelichting: "Mid-range datapunt, exact match in barema-tabel.",
    render: () => {
      const r = lookupBarema("I", "A", 5);
      return (
        <ResultCard
          label="Schaal I — Cat A — 5 j"
          amountEUR={r.maandloonEUR}
          datapunten={[r.datapunt]}
        />
      );
    },
  },
  {
    id: "TC-08",
    titel: "Bouw-subset (extra 1,80 % aanvullend pensioen)",
    toelichting:
      "Dezelfde RSZ-rekening als TC-1 maar met extra werkgeversbijdrage van 1,80 % bouw.",
    render: () => {
      const r = rszBijdragen({ brutoloon: 3000, refDatum: "2026-06-01", bouwVlag: true });
      return (
        <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="mb-2 text-sm font-medium text-zinc-700">
            RSZ — bouw-subset, brutoloon € 3 000
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
                <td className="py-2 pr-2">Totaal werkgever</td>
                <td className="py-2 pr-2 text-right tabular-nums text-blue-800">
                  {formatEUR(r.totaalWerkgever)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      );
    },
  },
  {
    id: "TC-09",
    titel: "Studentenbarema, Cat A, 17 jaar",
    toelichting: "Exact-match leeftijd in studentenbarema.",
    render: () => {
      const r = lookupStudentenbarema("A", 17);
      return (
        <ResultCard
          label="Studenten — Cat A — 17 j"
          amountEUR={r.maandloonEUR}
          datapunten={[r.datapunt]}
        />
      );
    },
  },
  {
    id: "TC-11",
    titel: "Jaarlijkse premie 2026",
    toelichting: "Vast bedrag uit dataset (datapunt pc200_jaarpremie_2026).",
    render: () => {
      const r = jaarlijksePremie2026("2026-06-01");
      return (
        <ResultCard
          label="Jaarpremie 2026"
          amountEUR={r.bedrag}
          datapunten={[r.datapunt]}
        />
      );
    },
  },
  {
    id: "TC-12",
    titel: "Eindejaarspremie pro-rata (6 mnd)",
    toelichting:
      "Brutoloon € 3 000, anciënniteit 12 mnd, prestatie 6 mnd → factor 6/12 = 0,5.",
    render: () => {
      const r = eindejaarspremie({
        brutoloon: 3000,
        ancienniteitMaanden: 12,
        prestatieMaandenInRefertepériode: 6,
      });
      return (
        <ResultCard
          label="Eindejaarspremie 6/12"
          amountEUR={r.premie}
          helper={r.toelichting}
          datapunten={[r.datapunt]}
        />
      );
    },
  },
  {
    id: "TC-13",
    titel: "Ecocheques voltijds (€ 250)",
    toelichting: "Tewerkstellingsbreuk = 1 → max bedrag.",
    render: () => {
      const r = ecocheques({ tewerkstellingsbreuk: 1, refDatum: "2026-06-01" });
      return (
        <ResultCard
          label={`Ecocheques (${r.schaalLabel})`}
          amountEUR={r.bedrag}
          datapunten={[r.datapunt]}
        />
      );
    },
  },
  {
    id: "TC-14",
    titel: "Ecocheques deeltijds 3/5 (€ 200)",
    toelichting: "Tewerkstellingsbreuk = 0,6 → schaal ≥ 3/5 < 4/5.",
    render: () => {
      const r = ecocheques({ tewerkstellingsbreuk: 0.6, refDatum: "2026-06-01" });
      return (
        <ResultCard
          label={`Ecocheques (${r.schaalLabel})`}
          amountEUR={r.bedrag}
          datapunten={[r.datapunt]}
        />
      );
    },
  },
  {
    id: "TC-15",
    titel: "Fietsvergoeding — vóór en na 1/10/2026",
    toelichting:
      "Pad A: pre-overgang levert geen berekening (banner). Post-overgang rekent met € 0,32/km.",
    render: () => {
      let pre: React.ReactNode;
      try {
        fietsvergoeding({ kmPerDag: 8, arbeidsdagen: 22, refDatum: "2026-06-01" });
        pre = <Banner kind="error" title="Onverwacht">Geen exception?</Banner>;
      } catch (e) {
        pre = (
          <Banner kind="info" title="Pre-1/10/2026">
            {(e as Error).message}
          </Banner>
        );
      }
      const post = fietsvergoeding({
        kmPerDag: 8,
        arbeidsdagen: 22,
        refDatum: "2026-11-01",
      });
      return (
        <div className="flex flex-col gap-3">
          {pre}
          <ResultCard
            label={`Fietsvergoeding 1/11/2026 — € ${post.tariefPerKm.toFixed(2)}/km × 8 km × 22 dgn`}
            amountEUR={post.vergoeding}
            datapunten={[post.datapunt]}
          />
        </div>
      );
    },
  },
  {
    id: "TC-16",
    titel: "Woon-werk trein 100 %",
    toelichting:
      "Treinkaart 2e klasse € 92 → werkgeverstussenkomst 100 % volgens CAO 19/9.",
    render: () => {
      const r = woonwerkTrein({
        treinkaartPrijsPerMaand: 92,
        refDatum: "2026-06-01",
      });
      return (
        <ResultCard
          label={`Woon-werk trein (${(r.fractie * 100).toFixed(0)} %)`}
          amountEUR={r.werkgeverstussenkomst}
          datapunten={[r.datapunt]}
        />
      );
    },
  },
  {
    id: "TC-17",
    titel: "Indexatie ondernemingsloon × 1,0221",
    toelichting: "Oud loon € 3 500 op 31/12/2025 → nieuw loon vanaf 1/1/2026.",
    render: () => {
      const r = indexeerLoon({ oudLoon: 3500, refDatum: "2026-06-01" });
      return (
        <ResultCard
          label={`Indexatie × ${r.coefficient}`}
          amountEUR={r.nieuwLoon}
          helper={`€ 3 500 × ${r.coefficient}`}
          datapunten={[r.datapunt]}
        />
      );
    },
  },
  {
    id: "TC-07",
    titel: "Brutoloon onder sectoraal minimum (faalpad)",
    toelichting:
      "Opgegeven loon € 1 500 << sectoraal minimum → ok=false met negatief verschil.",
    render: () => {
      const c = brutolocheck("I", "A", 5, 1500);
      return c.ok ? (
        <Banner kind="success" title="Onverwacht">Check geslaagd?</Banner>
      ) : (
        <Banner kind="error" title="Brutoloon onder sectoraal minimum">
          Verschil {formatEUR(c.verschil)} — sectoraal minimum {formatEUR(c.sectoraalMinimum)}.
        </Banner>
      );
    },
  },
];

export function TestcasesPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h2 className="text-xl font-semibold">Testcases (live reproduceerbaar)</h2>
        <p className="mt-1 text-sm text-zinc-600">
          Twaalf van de twintig golden testcases, herberekend in de browser
          tegen de bundled dataset. De volledige set draait via{" "}
          <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs">bun test</code>.
        </p>
      </header>
      <div className="flex flex-col gap-6">
        {TESTCASES.map((tc) => (
          <div key={tc.id} className="flex flex-col gap-2">
            <div>
              <span className="font-mono text-xs text-zinc-500">{tc.id}</span>
              <span className="ml-2 text-sm font-semibold text-zinc-900">
                {tc.titel}
              </span>
              <p className="text-xs text-zinc-600">{tc.toelichting}</p>
            </div>
            <div>{tc.render()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
