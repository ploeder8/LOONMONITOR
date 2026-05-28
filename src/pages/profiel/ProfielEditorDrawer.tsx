import { X } from "lucide-react";

import type { Profiel } from "@/lib/profiel";
import { ProfielEditor, ProfielEditorHeader } from "@/pages/profiel/ProfielEditor";
import type { ProfielSetter } from "@/pages/home/types";

export function ProfielEditorDrawer({
  open,
  profiel,
  set,
  onClose,
}: {
  open: boolean;
  profiel: Profiel;
  set: ProfielSetter;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="profiel-editor-drawer"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 210,
        background: "rgba(19,31,55,0.42)",
        display: "flex",
        justifyContent: "flex-end",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <aside
        style={{
          width: "min(760px, 100%)",
          height: "100%",
          background: "var(--color-background)",
          boxShadow: "-18px 0 44px rgba(19,31,55,0.18)",
          overflowY: "auto",
          padding: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 16,
            marginBottom: 22,
          }}
        >
          <ProfielEditorHeader />
          <button
            type="button"
            onClick={onClose}
            aria-label="Profiel sluiten"
            style={{
              width: 34,
              height: 34,
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border)",
              background: "var(--color-surface)",
              color: "var(--color-text)",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <X size={16} />
          </button>
        </div>
        <ProfielEditor profiel={profiel} set={set} />
      </aside>
    </div>
  );
}
