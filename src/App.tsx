import { HashRouter, NavLink, Route, Routes, useLocation } from "react-router-dom";
import { HomePage } from "@/pages/HomePage";
import { ScopePage } from "@/pages/ScopePage";
import { TestcasesPage } from "@/pages/TestcasesPage";
import { APP_BRAND } from "@/branding/brand";
import { AiChatWidget } from "@/components/AiChatWidget";

const DEFAULT_CONTENT_MAX_WIDTH = 1180;
const CALCULATOR_CONTENT_MAX_WIDTH = 1520;

export const headerContentLayout = {
  maxWidth: "none",
  margin: "0",
} as const;

export function mainMaxWidthForPath(pathname: string): number {
  return pathname === "/" ? CALCULATOR_CONTENT_MAX_WIDTH : DEFAULT_CONTENT_MAX_WIDTH;
}

export function App() {
  return (
    <HashRouter>
      <AppShell />
    </HashRouter>
  );
}

function AppShell() {
  const location = useLocation();
  const mainMaxWidth = mainMaxWidthForPath(location.pathname);

  return (
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
              ...headerContentLayout,
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
              <a
                href="/onderzoek/index.html"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: "8px 14px",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--color-navy-500)",
                  borderRadius: "var(--radius-md)",
                  textDecoration: "none",
                  fontFamily: "var(--font-body)",
                  letterSpacing: 0,
                  transition: "background 0.15s, color 0.15s",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--color-primary-soft)";
                  e.currentTarget.style.color = "var(--color-primary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--color-navy-500)";
                }}
              >
                Onderzoeksdossier
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </a>
            </nav>
          </div>
        </header>

        <main className="app-main" style={{ maxWidth: mainMaxWidth, width: "100%", boxSizing: "border-box", margin: "0 auto", padding: "28px 28px" }}>
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
          <div style={{ maxWidth: DEFAULT_CONTENT_MAX_WIDTH, margin: "0 auto", fontSize: 12, color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}>
            {APP_BRAND.footerCopy}
          </div>
        </footer>
        <AiChatWidget />
      </div>
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
