import { IdCard, UserRound } from "lucide-react";
import { CockpitCard } from "@/components/CockpitCard";
import { FormField, inputClass } from "@/components/Field";
import type { Profiel } from "@/lib/profiel";
import { InputCockpit } from "@/pages/home/InputCockpit";
import type { ProfielSetter } from "@/pages/home/types";
function IdentificatieCard({ profiel, set }: {
    profiel: Profiel;
    set: ProfielSetter;
}) {
    return (<CockpitCard title="Identificatie" icon={<IdCard size={16}/>}>
      <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 14 }}>
        <FormField label="Werknemer naam">
          <input type="text" value={profiel.werknemerNaam} onChange={(e) => set("werknemerNaam", e.target.value)} className={inputClass} placeholder="bv. Jan Jansen"/>
        </FormField>
        <FormField label="Werknemer referentie">
          <input type="text" value={profiel.werknemerReferentie} onChange={(e) => set("werknemerReferentie", e.target.value)} className={inputClass} placeholder="bv. W12345"/>
        </FormField>
        <FormField label="Werkgever naam">
          <input type="text" value={profiel.werkgeverNaam} onChange={(e) => set("werkgeverNaam", e.target.value)} className={inputClass} placeholder="bv. Acme BV"/>
        </FormField>
        <FormField label="Werkgever ondernemingsnummer">
          <input type="text" value={profiel.werkgeverOndernemingsnummer} onChange={(e) => set("werkgeverOndernemingsnummer", e.target.value)} className={inputClass} placeholder="bv. 0123.456.789"/>
        </FormField>
      </div>
    </CockpitCard>);
}
export function ProfielEditor({ profiel, set, toonIdentificatie = true, }: {
    profiel: Profiel;
    set: ProfielSetter;
    toonIdentificatie?: boolean;
}) {
    return (<div style={{ display: "flex", flexDirection: "column", gap: "var(--cockpit-grid-gap)" }}>
      {toonIdentificatie && <IdentificatieCard profiel={profiel} set={set}/>}
      <InputCockpit profiel={profiel} set={set}/>
    </div>);
}
export function ProfielEditorHeader() {
    return (<div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{
            width: 34,
            height: 34,
            borderRadius: "var(--radius-md)",
            background: "var(--color-primary-soft)",
            color: "var(--color-primary)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
        }}>
        <UserRound size={18}/>
      </span>
      <div>
        <div style={{
            fontFamily: "var(--font-display)",
            fontSize: 16,
            fontWeight: 800,
            color: "var(--color-text)",
        }}>
          Werknemerprofiel
        </div>
        <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
          Centrale invoer voor calculator, loonfiche en loonrun.
        </div>
      </div>
    </div>);
}
