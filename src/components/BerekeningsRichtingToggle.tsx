import { ArrowRightLeft } from "lucide-react";

export type BerekeningsRichting = "bruto_naar_netto" | "netto_naar_bruto";

interface Props {
  value: BerekeningsRichting;
  onChange: (value: BerekeningsRichting) => void;
}

export function BerekeningsRichtingToggle({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-2">
      <ArrowRightLeft className="w-4 h-4 text-gray-500" />
      <span className="text-sm font-medium text-gray-700">Richting</span>
      <div className="inline-flex rounded-md shadow-sm" role="group">
        <button
          type="button"
          onClick={() => onChange("bruto_naar_netto")}
          className={
            "px-3 py-1.5 text-sm font-medium rounded-l-lg border " +
            (value === "bruto_naar_netto"
              ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
              : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50")
          }
        >
          Bruto → Netto
        </button>
        <button
          type="button"
          onClick={() => onChange("netto_naar_bruto")}
          className={
            "px-3 py-1.5 text-sm font-medium rounded-r-lg border border-l-0 " +
            (value === "netto_naar_bruto"
              ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
              : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50")
          }
        >
          Netto → Bruto
        </button>
      </div>
    </div>
  );
}
