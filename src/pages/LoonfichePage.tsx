import { useMemo, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Calculator, FileText, Printer } from "lucide-react";

import { Banner } from "@/components/Banner";
import { FormField, inputClass, selectClass } from "@/components/Field";
import { useSharedProfiel } from "@/lib/useSharedProfiel";
import { bouwLoonficheVoorProfiel } from "@/lib/loonfiche";
import type { Profiel, GezinsType, Statuut } from "@/lib/profiel";
import { normaliseerProfiel } from "@/lib/profiel";
import { NumeriekeInput } from "@/pages/home/FormControls";
import { LoonficheDocument } from "@/pages/loonfiche/LoonficheDocument";

export function LoonfichePage() {
  const [p, setP] = useSharedProfiel();
  const profiel = normaliseerProfiel(p);
  const [toonBronnen, setToonBronnen] = useState(true);

  function set<K extends keyof Profiel>(k: K, v: Profiel[K]) {
    setP((prev) => ({ ...normaliseerProfiel(prev), [k]: v }));
  }

  const loonfiche = useMemo(() => {
    try {
      return bouwLoonficheVoorProfiel(profiel);
    } catch (e) {
      throw e;
    }
  }, [profiel]);

  const isNettoNaarBruto = profiel.berekeningsRichting === "netto_naar_bruto";

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "1.5rem 1rem" }}>
      {/* Compacte input toolbar */}
      <div
        className="loonfiche-toolbar"
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          padding: "16px 20px",
          marginBottom: 24,
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 12,
            fontFamily: "var(--font-display)",
            fontSize: 14,
            fontWeight: 700,
            color: "var(--color-text)",
          }}
        >
          <Calculator size={16} />
          Calculator
        </div>

        {/* Rij 1 — kernberekeningsvelden */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "12px 16px",
            alignItems: "end",
            marginBottom: 12,
          }}
        >
          <FormField label={isNettoNaarBruto ? "Doelnettoloon (€)" : "Brutoloon (€)"}>
            <NumeriekeInput
              value={isNettoNaarBruto ? profiel.doelNettoloon : profiel.brutoloon}
              onValueChange={(v) => set(isNettoNaarBruto ? "doelNettoloon" : "brutoloon", v)}
              className={inputClass}
            />
          </FormField>

          <FormField label="Periode">
            <div style={{ display: "flex", gap: 8 }}>
              <select
                value={profiel.berekeningsMaand}
                onChange={(e) => set("berekeningsMaand", e.target.value)}
                className={selectClass}
                style={{ flex: 1 }}
              >
                {Array.from({ length: 12 }, (_, i) => {
                  const num = String(i + 1).padStart(2, "0");
                  const naam = [
                    "januari", "februari", "maart", "april", "mei", "juni",
                    "juli", "augustus", "september", "oktober", "november", "december",
                  ][i];
                  return (
                    <option key={num} value={num}>
                      {naam}
                    </option>
                  );
                })}
              </select>
              <select
                value={profiel.berekeningsJaar}
                onChange={(e) => set("berekeningsJaar", e.target.value)}
                className={selectClass}
                style={{ flex: 1 }}
              >
                <option value="2026">2026</option>
              </select>
            </div>
          </FormField>

          <FormField label="Statuut">
            <select
              value={profiel.statuut}
              onChange={(e) => set("statuut", e.target.value as Statuut)}
              className={selectClass}
            >
              <option value="bediende">Bediende</option>
              <option value="student">Student</option>
            </select>
          </FormField>

          <FormField label="Gezinstype">
            <select
              value={profiel.gezinstype}
              onChange={(e) => set("gezinstype", e.target.value as GezinsType)}
              className={selectClass}
            >
              <option value="alleenstaand">Alleenstaand</option>
              <option value="gehuwd_met_inkomen">Gehuwd / samenwonend met inkomen</option>
              <option value="gehuwd_zonder_inkomen">Gehuwd / samenwonend zonder inkomen</option>
            </select>
          </FormField>

          <FormField label="Kinderen ten laste">
            <NumeriekeInput
              value={profiel.kinderenTenLaste}
              onValueChange={(v) => set("kinderenTenLaste", Math.max(0, Math.round(v)))}
              modus="int"
              className={inputClass}
            />
          </FormField>

          <FormField label="Tewerkstellingsbreuk (%)">
            <NumeriekeInput
              value={Math.round(profiel.tewerkstellingsbreuk * 100)}
              onValueChange={(v) => set("tewerkstellingsbreuk", Math.max(0, Math.min(100, v)) / 100)}
              modus="int"
              className={inputClass}
            />
          </FormField>

          <FormField label="Arbeidsdagen/maand">
            <NumeriekeInput
              value={profiel.arbeidsdagenPerMaand}
              onValueChange={(v) => set("arbeidsdagenPerMaand", Math.max(0, Math.round(v)))}
              modus="int"
              className={inputClass}
            />
          </FormField>

          <FormField label="Maaltijdcheques">
            <div style={{ display: "flex", alignItems: "center", gap: 8, height: 40 }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  cursor: "pointer",
                  fontSize: 13,
                  color: "var(--color-text)",
                }}
              >
                <input
                  type="checkbox"
                  checked={profiel.maaltijdchequesActief}
                  onChange={(e) => set("maaltijdchequesActief", e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: "var(--color-primary)" }}
                />
                Actief
              </label>
            </div>
          </FormField>
        </div>

        {/* Rij 2 — identificatievelden */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "12px 16px",
            alignItems: "end",
            paddingTop: 12,
            borderTop: "1px solid var(--color-border)",
          }}
        >
          <FormField label="Werknemer naam">
            <input
              type="text"
              value={profiel.werknemerNaam}
              onChange={(e) => set("werknemerNaam", e.target.value)}
              className={inputClass}
              placeholder="bv. Jan Jansen"
            />
          </FormField>

          <FormField label="Werknemer referentie">
            <input
              type="text"
              value={profiel.werknemerReferentie}
              onChange={(e) => set("werknemerReferentie", e.target.value)}
              className={inputClass}
              placeholder="bv. W12345"
            />
          </FormField>

          <FormField label="Werkgever naam">
            <input
              type="text"
              value={profiel.werkgeverNaam}
              onChange={(e) => set("werkgeverNaam", e.target.value)}
              className={inputClass}
              placeholder="bv. Acme BV"
            />
          </FormField>

          <FormField label="Werkgever ondernemingsnummer">
            <input
              type="text"
              value={profiel.werkgeverOndernemingsnummer}
              onChange={(e) => set("werkgeverOndernemingsnummer", e.target.value)}
              className={inputClass}
              placeholder="bv. 0123.456.789"
            />
          </FormField>
        </div>
      </div>

      {/* Actieknoppen */}
      <div
        className="loonfiche-acties"
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 8,
          marginBottom: 16,
        }}
      >
        <button
          type="button"
          onClick={() => setToonBronnen(!toonBronnen)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 12px",
            fontSize: 12,
            fontWeight: 600,
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-primary-border)",
            background: toonBronnen ? "var(--color-primary)" : "var(--color-surface)",
            color: toonBronnen ? "#fff" : "var(--color-primary)",
            cursor: "pointer",
            fontFamily: "var(--font-body)",
            transition: "background 0.15s, color 0.15s",
          }}
        >
          <FileText size={14} />
          {toonBronnen ? "Verberg bronnen" : "Toon bronnen"}
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 12px",
            fontSize: 12,
            fontWeight: 600,
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-primary-border)",
            background: "var(--color-primary)",
            color: "#fff",
            cursor: "pointer",
            fontFamily: "var(--font-body)",
            transition: "background 0.15s",
          }}
        >
          <Printer size={14} />
          Print loonfiche
        </button>
      </div>

      {/* Loonfiche document */}
      <ErrorBoundary
        fallbackRender={({ error, resetErrorBoundary }) => (
          <Banner kind="error" title="Onverwachte fout bij het opbouwen van de loonfiche">
            <p>{(error as Error).message}</p>
            <button
              onClick={resetErrorBoundary}
              style={{
                marginTop: 8,
                borderRadius: 4,
                background: "var(--color-primary-border)",
                border: "none",
                padding: "4px 12px",
                fontSize: 12,
                cursor: "pointer",
                color: "var(--color-text)",
              }}
            >
              Opnieuw proberen
            </button>
          </Banner>
        )}
        resetKeys={[JSON.stringify(profiel)]}
      >
        <LoonficheDocument loonfiche={loonfiche} toonBronnen={toonBronnen} />
      </ErrorBoundary>
    </div>
  );
}
