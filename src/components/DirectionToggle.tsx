import type { BerekeningsRichting } from "@/lib/profiel";

interface DirectionToggleProps {
    value: BerekeningsRichting;
    onChange: (dir: BerekeningsRichting) => void;
}

export function DirectionToggle({ value, onChange }: DirectionToggleProps) {
    return (<div className="direction-toggle direction-toggle-compact">
      <div className="direction-toggle-track" style={{ background: "var(--toggle-bg)" }}>
        <button type="button" aria-pressed={value === "bruto_naar_netto"} onClick={() => onChange("bruto_naar_netto")} className="direction-toggle-button" style={{
            background: value === "bruto_naar_netto"
                ? "var(--toggle-active-bg)"
                : "var(--toggle-inactive-bg)",
            color: value === "bruto_naar_netto"
                ? "var(--toggle-active-text)"
                : "var(--toggle-inactive-text)",
            fontFamily: "var(--font-display)",
        }}>
          Bruto → Netto
        </button>
        <button type="button" aria-pressed={value === "netto_naar_bruto"} onClick={() => onChange("netto_naar_bruto")} className="direction-toggle-button" style={{
            background: value === "netto_naar_bruto"
                ? "var(--toggle-active-bg)"
                : "var(--toggle-inactive-bg)",
            color: value === "netto_naar_bruto"
                ? "var(--toggle-active-text)"
                : "var(--toggle-inactive-text)",
            fontFamily: "var(--font-display)",
        }}>
          Netto → Bruto
        </button>
      </div>
    </div>);
}
