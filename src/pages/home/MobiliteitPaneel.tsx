import type { ReactNode } from "react";
import { Bike, Bus, Car, Train } from "lucide-react";

import { CockpitCard } from "@/components/CockpitCard";
import { FormField, inputClass, selectClass } from "@/components/Field";
import type { BrandstofBedrijfswagen, Profiel } from "@/lib/profiel";
import { HelpTooltip, miniButtonStyle, NumeriekeInput } from "@/pages/home/FormControls";
import type { ProfielSetter } from "@/pages/home/types";

export function MobiliteitPaneel({
  profiel,
  set,
  setAlleWoonwerk,
}: {
  profiel: Profiel;
  set: ProfielSetter;
  setAlleWoonwerk: (actief: boolean) => void;
}) {
  const toggleFiets = (v: boolean) => {
    set("woonwerkFiets", v);
    if (v) set("woonwerkPrivewagen", false);
  };
  const togglePrivewagen = (v: boolean) => {
    set("woonwerkPrivewagen", v);
    if (v) set("woonwerkFiets", false);
  };

  return (
    <CockpitCard title="Woon-werk verkeer" icon={<Bike size={16} />}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {/* ── Werkgeverstussenkomst (vergoeding) ── */}
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-navy-500)", letterSpacing: 0.3, textTransform: "uppercase" }}>
          Werkgeverstussenkomst
        </div>
        <p style={{ fontSize: 11, color: "var(--color-text-muted)", marginTop: -6 }}>
          Vrijgesteld van RSZ en bedrijfsvoorheffing binnen bepaalde grenzen. Telt mee in het nettoloon.
        </p>

        {/* Fiets */}
        <VervoersmiddelRij
          label="Fiets"
          icon={<Bike size={15} />}
          actief={profiel.woonwerkFiets}
          onChange={toggleFiets}
        >
          {profiel.woonwerkFiets && (
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <NumeriekeInput
                className={inputClass}
                min={0}
                value={profiel.kmPerDag}
                onValueChange={(waarde) => set("kmPerDag", waarde)}
                style={{ width: 70, textAlign: "right" }}
              />
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text-muted)" }}>km/dag (totaal)</span>
            </div>
          )}
        </VervoersmiddelRij>

        {/* Privéwagen */}
        <VervoersmiddelRij
          label="Privéwagen"
          icon={<Car size={15} />}
          actief={profiel.woonwerkPrivewagen}
          onChange={togglePrivewagen}
        >
          {profiel.woonwerkPrivewagen && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <NumeriekeInput
                  className={inputClass}
                  min={0}
                  value={profiel.privewagenKm}
                  onValueChange={(waarde) => set("privewagenKm", waarde)}
                  style={{ width: 70, textAlign: "right" }}
                />
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text-muted)" }}>km/dag (enkele rit)</span>
              </div>
            </>
          )}
        </VervoersmiddelRij>
        {profiel.woonwerkPrivewagen && (
          <div className="flex items-center gap-3" style={{ paddingLeft: 32, marginTop: -4 }}>
            <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>Beroepskost</span>
            <label className="flex items-center gap-1 text-sm cursor-pointer">
              <input
                type="radio"
                name="privewagen-beroepskost"
                value="forfaitair"
                checked={profiel.woonwerkPrivewagenBeroepskostMethode === "forfaitair"}
                onChange={() => set("woonwerkPrivewagenBeroepskostMethode", "forfaitair")}
              />
              Forfaitair
            </label>
            <label className="flex items-center gap-1 text-sm cursor-pointer">
              <input
                type="radio"
                name="privewagen-beroepskost"
                value="reeel"
                checked={profiel.woonwerkPrivewagenBeroepskostMethode === "reeel"}
                onChange={() => set("woonwerkPrivewagenBeroepskostMethode", "reeel")}
              />
              Reëel
            </label>
            <HelpTooltip text="Forfaitair: de woon-werkvergoeding is vrijgesteld tot €500/jaar (automatisch verrekend). Reëel: geen automatische vrijstelling op het loon — werkelijke kosten worden manueel op de fiscale fiche opgenomen." />
          </div>
        )}

        {/* Bus / tram / metro */}
        <VervoersmiddelRij
          label="Bus / tram / metro"
          icon={<Bus size={15} />}
          actief={profiel.woonwerkBusTramMetro}
          onChange={(v) => set("woonwerkBusTramMetro", v)}
        >
          {profiel.woonwerkBusTramMetro && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <NumeriekeInput
                  className={inputClass}
                  min={0}
                  value={profiel.busTramMetroKm}
                  onValueChange={(waarde) => set("busTramMetroKm", waarde)}
                  style={{ width: 70, textAlign: "right" }}
                />
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text-muted)" }}>km/dag (enkele rit)</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <NumeriekeInput
                  className={inputClass}
                  step="0.01"
                  min={0}
                  value={profiel.busTramMetroPrijs}
                  onValueChange={(waarde) => set("busTramMetroPrijs", waarde)}
                  style={{ width: 70, textAlign: "right" }}
                />
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text-muted)" }}>€/m</span>
              </div>
            </>
          )}
        </VervoersmiddelRij>

        {/* Trein */}
        <VervoersmiddelRij
          label="Trein"
          icon={<Train size={15} />}
          actief={profiel.woonwerkTrein}
          onChange={(v) => set("woonwerkTrein", v)}
        >
          {profiel.woonwerkTrein && (
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <NumeriekeInput
                className={inputClass}
                min={0}
                value={profiel.treinKm}
                onValueChange={(waarde) => set("treinKm", waarde)}
                style={{ width: 70, textAlign: "right" }}
              />
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text-muted)" }}>km/dag (enkele rit)</span>
            </div>
          )}
        </VervoersmiddelRij>

        {/* Bedrijfswagen */}
        <VervoersmiddelRij
          label="Bedrijfswagen"
          icon={<Car size={15} />}
          actief={profiel.woonwerkBedrijfswagen}
          onChange={(v) => set("woonwerkBedrijfswagen", v)}
        />
        {profiel.woonwerkBedrijfswagen && (
          <div style={{ paddingLeft: 32, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <FormField label="Cataloguswaarde (€)">
              <NumeriekeInput
                className={inputClass}
                step="0.01"
                min={0}
                value={profiel.bedrijfswagenCataloguswaarde}
                onValueChange={(waarde) => set("bedrijfswagenCataloguswaarde", waarde)}
              />
            </FormField>
            <FormField label="Eerste inschrijving">
              <input
                className={inputClass}
                type="date"
                value={profiel.bedrijfswagenDatumEersteInschrijving}
                onChange={(e) => set("bedrijfswagenDatumEersteInschrijving", e.target.value)}
              />
            </FormField>
            <FormField label="Brandstof">
              <select
                className={selectClass}
                value={profiel.bedrijfswagenBrandstof}
                onChange={(e) =>
                  set("bedrijfswagenBrandstof", e.target.value as BrandstofBedrijfswagen)
                }
              >
                <option value="diesel">Diesel</option>
                <option value="benzine">Benzine</option>
                <option value="elektriciteit">Elektriciteit</option>
              </select>
            </FormField>
            {profiel.bedrijfswagenBrandstof !== "elektriciteit" && (
              <FormField label="CO₂-waarde">
                <NumeriekeInput
                  className={inputClass}
                  min={0}
                  value={profiel.bedrijfswagenCo2}
                  onValueChange={(waarde) => set("bedrijfswagenCo2", waarde)}
                />
              </FormField>
            )}
            <div className="flex items-center gap-3" style={{ gridColumn: "1 / -1", paddingLeft: 4 }}>
              <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>Berekeningsmethode</span>
              <label className="flex items-center gap-1 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="bw-beroepskost"
                  value="forfaitair"
                  checked={profiel.woonwerkBedrijfswagenBeroepskostMethode === "forfaitair"}
                  onChange={() => set("woonwerkBedrijfswagenBeroepskostMethode", "forfaitair")}
                />
                Forfaitair
              </label>
              <label className="flex items-center gap-1 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="bw-beroepskost"
                  value="reeel"
                  checked={profiel.woonwerkBedrijfswagenBeroepskostMethode === "reeel"}
                  onChange={() => set("woonwerkBedrijfswagenBeroepskostMethode", "reeel")}
                />
                Reëel
              </label>
              <HelpTooltip text="Forfaitair: de VAA bedrijfswagen wordt opgenomen in de belastbare basis volgens de CO₂-formule. Reëel: de VAA blijft van toepassing; werkelijke beroepskosten worden manueel op de fiscale fiche opgenomen." />
            </div>
          </div>
        )}

        <p style={{ fontSize: 11, color: "var(--color-primary)", fontWeight: 500, marginTop: -4 }}>
          ℹ️ Trein, bus/tram/metro en privéwagen mogen samen als aparte trajectdelen.
        </p>

        <div style={{ display: "flex", gap: 8, marginTop: 2 }}>
          <button type="button" onClick={() => setAlleWoonwerk(true)} style={miniButtonStyle}>
            Selecteer alle vergoedingen
          </button>
          <button type="button" onClick={() => setAlleWoonwerk(false)} style={miniButtonStyle}>
            Alles wissen
          </button>
        </div>
      </div>
    </CockpitCard>
  );
}

function VervoersmiddelRij({
  label,
  icon,
  actief,
  onChange,
  children,
}: {
  label: string;
  icon: ReactNode;
  actief: boolean;
  onChange: (v: boolean) => void;
  children?: ReactNode;
}) {
  return (
    <div>
      <label
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          padding: "10px 12px",
          borderRadius: "var(--radius-md)",
          border: `1px solid ${actief ? "var(--cockpit-toggle-active-border)" : "var(--cockpit-toggle-inactive-border)"}`,
          background: actief ? "var(--cockpit-toggle-active-bg)" : "var(--cockpit-toggle-inactive-bg)",
          cursor: "pointer",
          transition: "all 0.15s ease",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={actief}
            onChange={(e) => onChange(e.target.checked)}
            style={{ accentColor: "var(--color-primary)", width: 16, height: 16 }}
          />
          <span style={{ color: actief ? "var(--color-primary)" : "var(--color-text-muted)", display: "flex" }}>
            {icon}
          </span>
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: actief ? "var(--color-primary)" : "var(--color-navy-500)",
            }}
          >
            {label}
          </span>
        </div>
        {children}
      </label>
    </div>
  );
}
