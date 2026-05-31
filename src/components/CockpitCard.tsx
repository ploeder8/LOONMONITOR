import type { ReactNode } from "react";
interface CockpitCardProps {
    title: string;
    icon: ReactNode;
    children: ReactNode;
    highlight?: boolean;
}
export function CockpitCard({ title, icon, children, highlight }: CockpitCardProps) {
    return (<div style={{
            background: highlight ? "rgba(239,255,250,0.3)" : "var(--cockpit-card-bg)",
            border: `1px solid ${highlight ? "rgba(28,210,163,0.3)" : "var(--cockpit-card-border)"}`,
            borderRadius: "var(--cockpit-card-radius)",
            boxShadow: "var(--cockpit-card-shadow)",
            padding: "var(--cockpit-card-padding)",
            transition: "box-shadow 0.2s ease",
        }} onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-md)";
        }} onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow = "var(--cockpit-card-shadow)";
        }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div style={{
            width: 32,
            height: 32,
            borderRadius: "var(--radius-md)",
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
            fontSize: 14,
            fontWeight: 700,
            color: "var(--color-text)",
        }}>
          {title}
        </span>
      </div>
      {children}
    </div>);
}
