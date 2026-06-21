import { FormField, inputClass } from "@/components/Field";
import { formatEUR } from "@/lib/money";
import { refDatumVoorMaand, type OnkostenCategorieKey, type Profiel } from "@/lib/profiel";
import { getOnkostenDatapuntId } from "@/lib/onkostenvergoeding";
import { safeGetValue } from "@/lib/periode";
import { HelpTooltip, NumeriekeInput } from "@/pages/home/FormControls";
import type { ProfielSetter } from "@/pages/home/types";

const ONKOSTEN_LABELS: Record<OnkostenCategorieKey, string> = {
    parking: "Parkingvergoeding",
    carwash: "Carwashvergoeding",
    garage: "Garagevergoeding",
    maaltijd: "Maaltijdvergoeding",
    baan: "Baanvergoeding",
    internet: "Internetvergoeding",
    thuiswerk: "Thuiswerkvergoeding",
    kilometer: "Kilometervergoeding",
};

const ONKOSTEN_EENHEID: Record<OnkostenCategorieKey, string> = {
    parking: "€/maand",
    carwash: "€/maand",
    garage: "€/maand",
    maaltijd: "€/dag",
    baan: "€/dag",
    internet: "€/maand",
    thuiswerk: "€/maand",
    kilometer: "€/km",
};

export function OnkostenvergoedingenContent({ profiel, set }: {
    profiel: Profiel;
    set: ProfielSetter;
}) {
    const refDatum = refDatumVoorMaand(profiel.berekeningsJaar, profiel.berekeningsMaand);
    function updateCategorie(key: OnkostenCategorieKey, patch: Partial<Profiel["onkostenCategorieen"][OnkostenCategorieKey]>) {
        set((prev) => ({
            ...prev,
            onkostenCategorieen: {
                ...prev.onkostenCategorieen,
                [key]: { ...prev.onkostenCategorieen[key], ...patch },
            },
        }));
    }
    return (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4" style={{ gap: 16 }}>
      {(Object.keys(ONKOSTEN_LABELS) as OnkostenCategorieKey[]).map((key) => {
            const cat = profiel.onkostenCategorieen[key];
            const lookup = safeGetValue(getOnkostenDatapuntId(key, refDatum), { refDatum });
            const forfait = lookup.waarde ?? cat.forfaitBedrag;
            const frequentie = (lookup.datapunt?.frequentie ?? "per_maand") as "per_maand" | "per_dag" | "per_km";
            const isPerDag = frequentie === "per_dag";
            const isPerKm = frequentie === "per_km";
            const heeftOverride = cat.overrideBedrag !== null;
            const toegepastBedrag = cat.overrideBedrag ?? forfait;
            const maandBedrag = isPerDag
                ? toegepastBedrag * Math.max(cat.aantalDagen, 0)
                : isPerKm
                    ? toegepastBedrag * Math.max(cat.aantalKm, 0)
                    : toegepastBedrag;
            return (<div key={key} style={{
                    background: "var(--cockpit-subsection-bg)",
                    borderRadius: "var(--cockpit-subsection-radius)",
                    padding: 16,
                    opacity: cat.actief ? 1 : 0.65,
                }}>
              <label style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontSize: 13,
                        fontWeight: 600,
                        color: "var(--color-navy-500)",
                        cursor: "pointer",
                        marginBottom: 10,
                    }}>
                <input type="checkbox" checked={cat.actief} onChange={(e) => updateCategorie(key, { actief: e.target.checked })} style={{ accentColor: "var(--color-primary)", width: 16, height: 16 }}/>
                {ONKOSTEN_LABELS[key]}
              </label>
              {cat.actief && (<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12, color: "var(--color-text-muted)" }}>
                    <span>Forfait: {formatEUR(forfait)} {ONKOSTEN_EENHEID[key]}</span>
                    {lookup.waarschuwing && <HelpTooltip text={lookup.waarschuwing}/>}
                  </div>
                  <label style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            fontSize: 12,
                            color: "var(--color-navy-500)",
                            cursor: "pointer",
                        }}>
                    <input type="checkbox" checked={heeftOverride} onChange={(e) => updateCategorie(key, { overrideBedrag: e.target.checked ? forfait : null })} style={{ accentColor: "var(--color-primary)", width: 14, height: 14 }}/>
                    Overschrijven
                  </label>
                  {heeftOverride && (<FormField label={`Bedrag (${ONKOSTEN_EENHEID[key]})`}>
                      <NumeriekeInput className={inputClass} step="0.01" min={0} value={cat.overrideBedrag ?? 0} onValueChange={(waarde) => updateCategorie(key, { overrideBedrag: waarde })}/>
                    </FormField>)}
                  {isPerDag && (<FormField label="Aantal dagen">
                      <NumeriekeInput className={inputClass} step="1" min={0} value={cat.aantalDagen} onValueChange={(waarde) => updateCategorie(key, { aantalDagen: waarde })}/>
                    </FormField>)}
                  {isPerKm && (<FormField label="Aantal km">
                      <NumeriekeInput className={inputClass} step="0.01" min={0} value={cat.aantalKm} onValueChange={(waarde) => updateCategorie(key, { aantalKm: waarde })}/>
                    </FormField>)}
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text)", textAlign: "right" }}>
                    = {formatEUR(maandBedrag)}/m
                  </div>
                </div>)}
            </div>);
        })}
    </div>);
}
