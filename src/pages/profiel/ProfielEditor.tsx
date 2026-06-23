import { UserRound } from "lucide-react";
import type { BerekeningsRichting } from "@/lib/profiel";
import type { Profiel } from "@/lib/profiel";
import { InputCockpit, PersoonsgegevensCard } from "@/pages/home/InputCockpit";
import { WerkgeverCard, WerkgeversbijdragenAccordion, WerkgeverPaneel } from "@/pages/home/WerkgeverPaneel";
import type { ProfielSetter } from "@/pages/home/types";

export type ProfielEditorLayout = "default" | "simulator2";

export function ProfielEditor({ profiel, set, toonWerkgever = true, onChangeRichting, layout = "default", }: {
    profiel: Profiel;
    set: ProfielSetter;
    toonWerkgever?: boolean;
    onChangeRichting?: (richting: BerekeningsRichting) => void;
    layout?: ProfielEditorLayout;
}) {
    if (layout === "simulator2" && toonWerkgever) {
        return (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--cockpit-grid-gap)" }}>
                <div className="simulator2-top-row" style={{ display: "grid", gap: "var(--cockpit-grid-gap)", alignItems: "stretch" }}>
                    <WerkgeverCard profiel={profiel} set={set} cardStyle={{ height: "100%" }} compact/>
                    <PersoonsgegevensCard profiel={profiel} set={set} cardStyle={{ height: "100%" }} compact/>
                </div>
                <WerkgeversbijdragenAccordion profiel={profiel} set={set}/>
                <InputCockpit profiel={profiel} set={set} onChangeRichting={onChangeRichting} hidePersoonsgegevens/>
            </div>
        );
    }
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--cockpit-grid-gap)" }}>
            {toonWerkgever && <WerkgeverPaneel profiel={profiel} set={set}/>}
            <InputCockpit profiel={profiel} set={set} onChangeRichting={onChangeRichting}/>
        </div>
    );
}

export function ProfielEditorHeader() {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
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
        </div>
    );
}
