import { useMemo, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { FileText, Printer, SlidersHorizontal } from "lucide-react";

import { Banner } from "@/components/Banner";
import { useSharedProfiel } from "@/lib/useSharedProfiel";
import { bouwLoonficheVoorProfiel } from "@/lib/loonfiche";
import type { Profiel } from "@/lib/profiel";
import { normaliseerProfiel } from "@/lib/profiel";
import type { ProfielSetter, ProfielUpdate } from "@/pages/home/types";
import { LoonficheDocument } from "@/pages/loonfiche/LoonficheDocument";
import { ProfielEditorDrawer } from "@/pages/profiel/ProfielEditorDrawer";
import { ProfielSnapshot } from "@/pages/profiel/ProfielSnapshot";

export function LoonfichePage() {
  const [p, setP] = useSharedProfiel();
  const profiel = normaliseerProfiel(p);
  const [toonBronnen, setToonBronnen] = useState(true);
  const [profielEditorOpen, setProfielEditorOpen] = useState(false);

  const set = ((kOfUpdate: keyof Profiel | ProfielUpdate, v?: Profiel[keyof Profiel]) => {
    setP((prev) => {
      const basis = normaliseerProfiel(prev);
      if (typeof kOfUpdate === "function") return kOfUpdate(basis);
      if (typeof kOfUpdate === "object") return { ...basis, ...kOfUpdate };
      return { ...basis, [kOfUpdate]: v };
    });
  }) as ProfielSetter;

  const loonfiche = useMemo(() => {
    try {
      return bouwLoonficheVoorProfiel(profiel);
    } catch (e) {
      throw e;
    }
  }, [profiel]);

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "1.5rem 1rem" }}>
      <div style={{ marginBottom: 16 }}>
        <ProfielSnapshot profiel={profiel} />
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
          onClick={() => setProfielEditorOpen(true)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 12px",
            fontSize: 12,
            fontWeight: 600,
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-primary-border)",
            background: "var(--color-surface)",
            color: "var(--color-primary)",
            cursor: "pointer",
            fontFamily: "var(--font-body)",
          }}
        >
          <SlidersHorizontal size={14} />
          Profiel bewerken
        </button>
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

      <ProfielEditorDrawer
        open={profielEditorOpen}
        profiel={profiel}
        set={set}
        onClose={() => setProfielEditorOpen(false)}
      />
    </div>
  );
}
