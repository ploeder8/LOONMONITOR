import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
interface CockpitAccordionProps {
    title: string;
    subtitle: string;
    icon: ReactNode;
    children: ReactNode;
    defaultOpen?: boolean;
    open?: boolean;
    onToggle?: () => void;
}
export function CockpitAccordion({ title, subtitle, icon, children, defaultOpen = false, open: controlledOpen, onToggle, }: CockpitAccordionProps) {
    const [internalOpen, setInternalOpen] = useState(defaultOpen);
    const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
    function toggle() {
        if (onToggle) {
            onToggle();
        }
        else {
            setInternalOpen(!open);
        }
    }
    return (<div style={{
            background: "var(--cockpit-card-bg)",
            border: "1px solid var(--cockpit-card-border)",
            borderRadius: "var(--cockpit-card-radius)",
            boxShadow: "var(--cockpit-card-shadow)",
            overflow: "hidden",
        }}>
      <button type="button" aria-expanded={open} onClick={toggle} style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px",
            border: "none",
            background: "transparent",
            cursor: "pointer",
        }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 24,
            height: 24,
            borderRadius: "var(--radius-sm)",
            background: "var(--cockpit-section-icon-bg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--cockpit-section-icon-color)",
        }}>
            {icon}
          </div>
          <div style={{ textAlign: "left" }}>
            <div style={{
            fontFamily: "var(--font-display)",
            fontSize: 13,
            fontWeight: 750,
            color: "var(--color-text)",
        }}>
              {title}
            </div>
            <div style={{
            fontSize: 11,
            fontWeight: 600,
            color: "var(--color-text-muted)",
        }}>
              {subtitle}
            </div>
          </div>
        </div>
        <ChevronDown size={16} style={{
            color: "var(--color-text-muted)",
            transition: "transform 0.3s",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
        }}/>
      </button>

      {open && (<div style={{
                padding: "0 14px 14px",
                borderTop: "1px solid var(--color-border)",
            }}>
          <div style={{ paddingTop: 10 }}>{children}</div>
        </div>)}
    </div>);
}
