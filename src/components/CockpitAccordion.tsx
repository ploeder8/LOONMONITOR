import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

interface CockpitAccordionProps {
  title: string;
  subtitle: string;
  icon: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}

export function CockpitAccordion({
  title,
  subtitle,
  icon,
  children,
  defaultOpen = false,
}: CockpitAccordionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      style={{
        background: "var(--cockpit-card-bg)",
        border: "1px solid var(--cockpit-card-border)",
        borderRadius: "var(--cockpit-card-radius)",
        boxShadow: "var(--cockpit-card-shadow)",
        overflow: "hidden",
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px",
          border: "none",
          background: "transparent",
          cursor: "pointer",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "var(--radius-md)",
              background: "var(--cockpit-section-icon-bg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--cockpit-section-icon-color)",
            }}
          >
            {icon}
          </div>
          <div style={{ textAlign: "left" }}>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 14,
                fontWeight: 700,
                color: "var(--color-text)",
              }}
            >
              {title}
            </div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--color-text-muted)",
              }}
            >
              {subtitle}
            </div>
          </div>
        </div>
        <ChevronDown
          size={20}
          style={{
            color: "var(--color-text-muted)",
            transition: "transform 0.3s",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      {open && (
        <div
          style={{
            padding: "0 20px 20px",
            borderTop: "1px solid var(--color-border)",
          }}
        >
          <div style={{ paddingTop: 16 }}>{children}</div>
        </div>
      )}
    </div>
  );
}
