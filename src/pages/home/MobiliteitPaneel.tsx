import type { ReactNode } from "react";
import { Bike, Bus, Car, Train } from "lucide-react";
import { CockpitCard } from "@/components/CockpitCard";
import { inputClass, selectClass } from "@/components/Field";
import type { BrandstofBedrijfswagen, Profiel } from "@/lib/profiel";
import { HelpTooltip, miniButtonStyle, NumeriekeInput } from "@/pages/home/FormControls";
import type { ProfielSetter } from "@/pages/home/types";

export function MobiliteitPaneel({ profiel, set, setAlleWoonwerk, }: {
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

    return (<CockpitCard icon={<Bike size={16}/>}>
      <div className="mobiliteit-paneel" style={{ display: "flex", flexDirection: "column", gap: 8 }}>

        <div className="mobiliteit-header">
          <div className="mobiliteit-heading">
            <span>Werkgeverstussenkomst</span>
            <HelpTooltip text="Vrijgesteld van RSZ en bedrijfsvoorheffing binnen bepaalde grenzen. Telt mee in het nettoloon. Trein, bus/tram/metro en privéwagen mogen samen als aparte trajectdelen."/>
          </div>
          <div className="mobiliteit-actions" style={{ display: "flex", gap: 6 }}>
            <button type="button" onClick={() => setAlleWoonwerk(true)} style={miniButtonStyle}>
              Selecteer alle
            </button>
            <button type="button" onClick={() => setAlleWoonwerk(false)} style={miniButtonStyle}>
              Alles wissen
            </button>
          </div>
        </div>

        <VervoersmiddelRij label="Fiets" icon={<Bike size={15}/>} actief={profiel.woonwerkFiets} onChange={toggleFiets}>
          {profiel.woonwerkFiets && (<CompactInputGroup>
              <NumeriekeInput className={inputClass} min={0} value={profiel.kmPerDag} onValueChange={(waarde) => set("kmPerDag", waarde)} style={{ width: 60, textAlign: "right" }}/>
              <span className="mobiliteit-input-label">km/dag (totaal)</span>
            </CompactInputGroup>)}
        </VervoersmiddelRij>

        <VervoersmiddelRij label="Privéwagen" icon={<Car size={15}/>} actief={profiel.woonwerkPrivewagen} onChange={togglePrivewagen}>
          {profiel.woonwerkPrivewagen && (<CompactInputGroup>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <NumeriekeInput className={inputClass} min={0} value={profiel.privewagenKm} onValueChange={(waarde) => set("privewagenKm", waarde)} style={{ width: 60, textAlign: "right" }}/>
                <span className="mobiliteit-input-label">km/dag</span>
              </div>
              <div className="mobiliteit-radio-pill">
                <label>
                  <input type="radio" name="privewagen-beroepskost" value="forfaitair" checked={profiel.woonwerkPrivewagenBeroepskostMethode === "forfaitair"} onChange={() => set("woonwerkPrivewagenBeroepskostMethode", "forfaitair")}/>
                  Forfaitair
                </label>
                <label>
                  <input type="radio" name="privewagen-beroepskost" value="reeel" checked={profiel.woonwerkPrivewagenBeroepskostMethode === "reeel"} onChange={() => set("woonwerkPrivewagenBeroepskostMethode", "reeel")}/>
                  Reëel
                </label>
              </div>
            </CompactInputGroup>)}
        </VervoersmiddelRij>

        <VervoersmiddelRij label="Bus / tram / metro" icon={<Bus size={15}/>} actief={profiel.woonwerkBusTramMetro} onChange={(v) => set("woonwerkBusTramMetro", v)}>
          {profiel.woonwerkBusTramMetro && (<CompactInputGroup>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <NumeriekeInput className={inputClass} min={0} value={profiel.busTramMetroKm} onValueChange={(waarde) => set("busTramMetroKm", waarde)} style={{ width: 60, textAlign: "right" }}/>
                <span className="mobiliteit-input-label">km/dag</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <NumeriekeInput className={inputClass} step="0.01" min={0} value={profiel.busTramMetroPrijs} onValueChange={(waarde) => set("busTramMetroPrijs", waarde)} style={{ width: 60, textAlign: "right" }}/>
                <span className="mobiliteit-input-label">€/m</span>
              </div>
            </CompactInputGroup>)}
        </VervoersmiddelRij>

        <VervoersmiddelRij label="Trein" icon={<Train size={15}/>} actief={profiel.woonwerkTrein} onChange={(v) => set("woonwerkTrein", v)}>
          {profiel.woonwerkTrein && (<CompactInputGroup>
              <NumeriekeInput className={inputClass} min={0} value={profiel.treinKm} onValueChange={(waarde) => set("treinKm", waarde)} style={{ width: 60, textAlign: "right" }}/>
              <span className="mobiliteit-input-label">km/dag</span>
            </CompactInputGroup>)}
        </VervoersmiddelRij>

        <VervoersmiddelRij label="Bedrijfswagen" icon={<Car size={15}/>} actief={profiel.woonwerkBedrijfswagen} onChange={(v) => set("woonwerkBedrijfswagen", v)}/>
        {profiel.woonwerkBedrijfswagen && (<div className="mobiliteit-bedrijfswagen-grid">
            <CompactField label="Cataloguswaarde (€)">
              <NumeriekeInput className={inputClass} step="0.01" min={0} value={profiel.bedrijfswagenCataloguswaarde} onValueChange={(waarde) => set("bedrijfswagenCataloguswaarde", waarde)}/>
            </CompactField>
            <CompactField label="Eerste inschrijving">
              <input className={inputClass} type="date" value={profiel.bedrijfswagenDatumEersteInschrijving} onChange={(e) => set("bedrijfswagenDatumEersteInschrijving", e.target.value)}/>
            </CompactField>
            <CompactField label="Brandstof">
              <select className={selectClass} value={profiel.bedrijfswagenBrandstof} onChange={(e) => set("bedrijfswagenBrandstof", e.target.value as BrandstofBedrijfswagen)}>
                <option value="diesel">Diesel</option>
                <option value="benzine">Benzine</option>
                <option value="elektriciteit">Elektriciteit</option>
              </select>
            </CompactField>
            {profiel.bedrijfswagenBrandstof !== "elektriciteit" && (<CompactField label="CO₂-waarde">
                <NumeriekeInput className={inputClass} min={0} value={profiel.bedrijfswagenCo2} onValueChange={(waarde) => set("bedrijfswagenCo2", waarde)}/>
              </CompactField>)}
            <div className="mobiliteit-bedrijfswagen-methode">
              <span className="mobiliteit-input-label">Berekeningsmethode</span>
              <div className="mobiliteit-radio-pill">
                <label>
                  <input type="radio" name="bw-beroepskost" value="forfaitair" checked={profiel.woonwerkBedrijfswagenBeroepskostMethode === "forfaitair"} onChange={() => set("woonwerkBedrijfswagenBeroepskostMethode", "forfaitair")}/>
                  Forfaitair
                </label>
                <label>
                  <input type="radio" name="bw-beroepskost" value="reeel" checked={profiel.woonwerkBedrijfswagenBeroepskostMethode === "reeel"} onChange={() => set("woonwerkBedrijfswagenBeroepskostMethode", "reeel")}/>
                  Reëel
                </label>
              </div>
              <HelpTooltip text="Forfaitaire beroepskosten (= openbaar vervoer: volledig vrijgesteld) (= privévervoer: tussenkomst onderworpen aan bedrijfsvoorheffing boven het fiscaal vrijgestelde bedrag). Werkelijke beroepskosten (= volledig onderworpen aan bedrijfsvoorheffing). Er wordt gekozen voor werkelijke beroepskosten indien de werkelijke kosten hoger zijn dan de forfaitaire beroepskosten. Bijkomend komt bij deze keuze de fiscale vrijstelling voor woon-werkverkeer te vervallen."/>
            </div>
          </div>)}

      </div>
    </CockpitCard>);
}

function CompactInputGroup({ children }: { children: ReactNode }) {
    return (<div className="mobiliteit-input-group" style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
      {children}
    </div>);
}

function CompactField({ label, children }: { label: ReactNode; children: ReactNode }) {
    return (<div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text)", fontFamily: "var(--font-body)" }}>{label}</span>
      {children}
    </div>);
}

function VervoersmiddelRij({ label, icon, actief, onChange, children, }: {
    label: string;
    icon: ReactNode;
    actief: boolean;
    onChange: (v: boolean) => void;
    children?: ReactNode;
}) {
    const id = `vm-${label.replace(/\s+/g, "").toLowerCase()}`;
    const handleRowClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement;
        if (target.closest("input, select, textarea, label, button")) return;
        onChange(!actief);
    };
    return (<div className={`mobiliteit-rij ${actief ? "is-active" : ""}`} onClick={handleRowClick}>
      <label htmlFor={id} className="mobiliteit-rij-left" onClick={(e) => e.stopPropagation()}>
        <input id={id} type="checkbox" checked={actief} onChange={(e) => onChange(e.target.checked)}/>
        <span className="mobiliteit-rij-icon" style={{ color: actief ? "var(--color-primary)" : "var(--color-text-muted)", display: "flex" }}>
          {icon}
        </span>
        <span className="mobiliteit-rij-label">{label}</span>
      </label>
      {children && <div className="mobiliteit-rij-right" onClick={(e) => e.stopPropagation()}>{children}</div>}
    </div>);
}
