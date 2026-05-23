import type { RefObject } from "react";
import { Download, Upload } from "lucide-react";

import { FormField, inputClass } from "@/components/Field";
import { miniButtonStyle } from "@/pages/home/FormControls";
import type { CsvStatus } from "@/pages/home/types";

export function CsvPaneel({
  exportNaam,
  setExportNaam,
  commentaar,
  setCommentaar,
  status,
  fileInputRef,
  onImport,
  onExport,
}: {
  exportNaam: string;
  setExportNaam: (waarde: string) => void;
  commentaar: string;
  setCommentaar: (waarde: string) => void;
  status: { kind: "success" | "error"; tekst: string } | null;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onImport: (file: File | null) => void;
  onExport: () => void;
}) {
  return (
    <div
      style={{
        border: "1px solid var(--color-border)",
        borderRadius: 8,
        padding: 10,
        display: "grid",
        gap: 10,
        background: "var(--color-navy-50)",
      }}
    >
      <FormField label="Exportnaam">
        <input
          className={inputClass}
          value={exportNaam}
          onChange={(e) => setExportNaam(e.target.value)}
        />
      </FormField>
      <FormField label="Commentaar">
        <textarea
          className={inputClass}
          rows={3}
          value={commentaar}
          onChange={(e) => setCommentaar(e.target.value)}
          style={{ resize: "vertical", minHeight: 76 }}
        />
      </FormField>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        onChange={(e) => onImport(e.target.files?.[0] ?? null)}
        style={{ display: "none" }}
      />
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          style={miniButtonStyle}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <Upload size={13} />
            Importeer CSV
          </span>
        </button>
        <button type="button" onClick={onExport} style={miniButtonStyle}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <Download size={13} />
            Exporteer CSV
          </span>
        </button>
      </div>
      {status && (
        <div
          style={{
            borderRadius: 8,
            padding: "7px 9px",
            fontSize: 12,
            color: status.kind === "success" ? "var(--color-success-dark)" : "#991b1b",
            background: status.kind === "success" ? "var(--color-mint-soft)" : "#fff1f2",
            border: `1px solid ${status.kind === "success" ? "rgba(28,210,163,0.35)" : "#fca5a5"}`,
          }}
        >
          {status.tekst}
        </div>
      )}
    </div>
  );
}
