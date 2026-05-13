import { HashRouter, NavLink, Route, Routes } from "react-router-dom";
import { HomePage } from "@/pages/HomePage";
import { ScopePage } from "@/pages/ScopePage";
import { TestcasesPage } from "@/pages/TestcasesPage";

export function App() {
  return (
    <HashRouter>
      <div className="min-h-screen" style={{ background: "#faf8f4", color: "#3c3c3b" }}>
        <header
          style={{
            background: "#ffffff",
            borderBottom: "3px solid #cbbba0",
            padding: "14px 28px",
            position: "sticky",
            top: 0,
            zIndex: 100,
            boxShadow: "0 2px 10px rgba(60,60,59,0.06)",
          }}
        >
          <div
            style={{
              maxWidth: 1180,
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <img src="/vh-logo.svg" alt="Van Havermaet" style={{ height: 34, width: "auto" }} />
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 15,
                    fontWeight: 600,
                    color: "#3c3c3b",
                    letterSpacing: "-0.01em",
                  }}
                >
                  PC 200 Loonmotor
                </span>
                <span style={{ fontSize: 11, color: "#9a8b7a", fontFamily: "var(--font-body)" }}>
                  Proof-of-concept · dataset 2026
                </span>
              </div>
            </div>
            <nav style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
              <NavItem to="/" label="Profiel" />
              <NavItem to="/testcases" label="Testcases" />
              <NavItem to="/scope" label="Scope & bekend manco" />
            </nav>
          </div>
        </header>

        <main style={{ maxWidth: 1180, margin: "0 auto", padding: "28px 28px" }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/testcases" element={<TestcasesPage />} />
            <Route path="/scope" element={<ScopePage />} />
          </Routes>
        </main>

        <footer
          style={{
            borderTop: "1px solid #e2ddd5",
            background: "#ffffff",
            padding: "16px 28px",
          }}
        >
          <div style={{ maxWidth: 1180, margin: "0 auto", fontSize: 12, color: "#9a8b7a", fontFamily: "var(--font-body)" }}>
            POC — PC 200 Loonmotor · Van Havermaet. Geen vervanging voor sociaal secretariaat.
            Raadpleeg altijd de primaire bronnen via de audit-panelen.
          </div>
        </footer>
      </div>
    </HashRouter>
  );
}

function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      end
      style={({ isActive }) => ({
        padding: "8px 14px",
        fontSize: 13,
        fontWeight: 600,
        color: isActive ? "#3c3c3b" : "#5a5a59",
        background: isActive ? "#cbbba0" : "transparent",
        borderRadius: 4,
        textDecoration: "none",
        fontFamily: "var(--font-body)",
        letterSpacing: "0.01em",
        transition: "background 0.15s, color 0.15s",
      })}
    >
      {label}
    </NavLink>
  );
}
