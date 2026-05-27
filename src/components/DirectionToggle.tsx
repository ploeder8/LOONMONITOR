import { ArrowLeftRight } from "lucide-react";
import type { BerekeningsRichting } from "@/lib/profiel";

interface DirectionToggleProps {
  value: BerekeningsRichting;
  onChange: (dir: BerekeningsRichting) => void;
}

export function DirectionToggle({ value, onChange }: DirectionToggleProps) {
  return (
    <div className="flex justify-center mb-5">
      <div
        className="inline-flex p-1 gap-0.5 rounded-full"
        style={{ background: "var(--toggle-bg)" }}
      >
        <button
          type="button"
          aria-pressed={value === "bruto_naar_netto"}
          onClick={() => onChange("bruto_naar_netto")}
          className="flex items-center gap-2 px-4 py-2.5 sm:px-6 rounded-full text-sm font-bold transition-all duration-200"
          style={{
            background:
              value === "bruto_naar_netto"
                ? "var(--toggle-active-bg)"
                : "var(--toggle-inactive-bg)",
            color:
              value === "bruto_naar_netto"
                ? "var(--toggle-active-text)"
                : "var(--toggle-inactive-text)",
            fontFamily: "var(--font-display)",
          }}
        >
          <ArrowLeftRight size={16} />
          Bruto → Netto
        </button>
        <button
          type="button"
          aria-pressed={value === "netto_naar_bruto"}
          onClick={() => onChange("netto_naar_bruto")}
          className="flex items-center gap-2 px-4 py-2.5 sm:px-6 rounded-full text-sm font-bold transition-all duration-200"
          style={{
            background:
              value === "netto_naar_bruto"
                ? "var(--toggle-active-bg)"
                : "var(--toggle-inactive-bg)",
            color:
              value === "netto_naar_bruto"
                ? "var(--toggle-active-text)"
                : "var(--toggle-inactive-text)",
            fontFamily: "var(--font-display)",
          }}
        >
          <ArrowLeftRight size={16} />
          Netto → Bruto
        </button>
      </div>
    </div>
  );
}
