import type { CSSProperties, ReactNode } from "react";
interface CockpitCardProps {
    title?: string;
    icon: ReactNode;
    children: ReactNode;
    highlight?: boolean;
    style?: CSSProperties;
}
export function CockpitCard({ title, icon, children, highlight, style }: CockpitCardProps) {
    return (<div className="cockpit-card" style={{
            background: highlight ? "rgba(239,255,250,0.3)" : "var(--cockpit-card-bg)",
            border: `1px solid ${highlight ? "rgba(28,210,163,0.3)" : "var(--cockpit-card-border)"}`,
            borderRadius: "var(--cockpit-card-radius)",
            boxShadow: "var(--cockpit-card-shadow)",
            padding: "var(--cockpit-card-padding)",
            transition: "box-shadow 0.2s ease",
            ...style,
        }}>
      {title && (<div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <div style={{
            width: 24,
            height: 24,
            borderRadius: "var(--radius-sm)",
            background: "var(--cockpit-section-icon-bg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--cockpit-section-icon-color)",
            flexShrink: 0,
        }}>
          {icon}
        </div>
        <span style={{
            fontFamily: "var(--font-display)",
            fontSize: 13,
            fontWeight: 750,
            color: "var(--color-text)",
        }}>
          {title}
        </span>
      </div>)}
      {children}
    </div>);
}
