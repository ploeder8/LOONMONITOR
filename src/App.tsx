import { HashRouter, NavLink, Route, Routes } from "react-router-dom";
import { HomePage } from "@/pages/HomePage";
import { ScopePage } from "@/pages/ScopePage";
import { TestcasesPage } from "@/pages/TestcasesPage";
import { APP_BRAND } from "@/branding/brand";

export function App() {
  return (
    <HashRouter>
      <div className="min-h-screen" style={{ background: "var(--color-background)", color: "var(--color-text)" }}>
        <header
          style={{
            background: "rgba(255,255,255,0.96)",
            borderBottom: "1px solid var(--color-border)",
            padding: "14px 28px",
            position: "sticky",
            top: 0,
            zIndex: 100,
            boxShadow: "var(--shadow-sm)",
            backdropFilter: "blur(10px)",
          }}
        >
          <div
            style={{
              maxWidth: 1180,
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
              <img src={APP_BRAND.logoSrc} alt={APP_BRAND.logoAlt} style={{ height: 38, width: "auto" }} />
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 15,
                    fontWeight: 800,
                    color: "var(--color-text)",
                    letterSpacing: 0,
                  }}
                >
                  {APP_BRAND.productLabel}
                </span>
                <span style={{ fontSize: 11, color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}>
                  {APP_BRAND.subtitle}
                </span>
              </div>
            </div>
            <nav className="app-nav" style={{ display: "flex", gap: 4, flexWrap: "wrap", maxWidth: "100%" }}>
              <NavItem to="/" label="Profiel" />
              <NavItem to="/testcases" label="Testcases" />
              <NavItem to="/scope" label="Scope & bekend manco" />
            </nav>
          </div>
        </header>

        <main className="app-main" style={{ maxWidth: 1180, width: "100%", boxSizing: "border-box", margin: "0 auto", padding: "28px 28px" }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/testcases" element={<TestcasesPage />} />
            <Route path="/scope" element={<ScopePage />} />
          </Routes>
        </main>

        <footer
          style={{
            borderTop: "1px solid var(--color-border)",
            background: "var(--color-surface)",
            padding: "16px 28px",
          }}
        >
          <div style={{ maxWidth: 1180, margin: "0 auto", fontSize: 12, color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}>
            {APP_BRAND.footerCopy}
          </div>
        </footer>
      </div>
    </HashRouter>
  );
}

function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      className="app-nav-link"
      to={to}
      end
      style={({ isActive }) => ({
        padding: "8px 14px",
        fontSize: 13,
        fontWeight: 600,
        color: isActive ? "var(--color-primary)" : "var(--color-navy-500)",
        background: isActive ? "var(--color-primary-soft)" : "transparent",
        border: isActive ? "1px solid var(--color-primary-border)" : "1px solid transparent",
        borderRadius: "var(--radius-md)",
        textDecoration: "none",
        fontFamily: "var(--font-body)",
        letterSpacing: 0,
        transition: "background 0.15s, color 0.15s",
      })}
    >
      {label}
    </NavLink>
  );
}
