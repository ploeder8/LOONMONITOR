import { HashRouter, Route, Routes, useLocation } from "react-router-dom";
import { BookOpen, Building2, Calculator, ChevronRight, FlaskConical, MessageCircle, MoreHorizontal } from "lucide-react";
import { HomePage } from "@/pages/HomePage";
import { LoonfichePage } from "@/pages/LoonfichePage";
import { LoonmotorPage } from "@/pages/LoonmotorPage";
import { LoonrunPage } from "@/pages/LoonrunPage";
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
export type PrimarySection = "loonmotor" | "simulator" | "ontwikkeling";
export const PRIMARY_NAV_ITEMS = [
    {
        id: "loonmotor",
        to: "/loonmotor",
        label: "Loonmotor",
        icon: Building2,
    },
    {
        id: "simulator",
        to: "/",
        label: "Simulator",
        icon: Calculator,
    },
    {
        id: "ontwikkeling",
        to: "/testcases",
        label: "Ontwikkeling",
        icon: FlaskConical,
    },
] as const;
export const SIMULATOR_SUBNAV_ITEMS = [
    { to: "/", label: "Calculator" },
    { to: "/loonfiche", label: "Loonfiche" },
    { to: "/loonrun", label: "Loonrun" },
] as const;
const DEVELOPMENT_SUBNAV_ITEMS = [
    { type: "route", to: "/testcases", label: "Testcases" },
    { type: "route", to: "/scope", label: "Scope & bekend manco" },
    { type: "external", href: "/onderzoek/index.html", label: "Onderzoeksdossier" },
] as const;
export function mainMaxWidthForPath(pathname: string): number {
    if (pathname === "/" || pathname === "/loonfiche" || pathname === "/loonrun" || pathname === "/loonmotor")
        return CALCULATOR_CONTENT_MAX_WIDTH;
    return DEFAULT_CONTENT_MAX_WIDTH;
}
export function activeSectionForPath(pathname: string): PrimarySection {
    if (pathname === "/loonmotor")
        return "loonmotor";
    if (pathname === "/" || pathname === "/loonfiche" || pathname === "/loonrun")
        return "simulator";
    return "ontwikkeling";
}
function sectionLabelForPath(pathname: string): string {
    const active = activeSectionForPath(pathname);
    return PRIMARY_NAV_ITEMS.find((item) => item.id === active)?.label ?? "Jaakie";
}
export function App() {
    return (<HashRouter>
      <AppShell />
    </HashRouter>);
}
function AppShell() {
    const location = useLocation();
    const mainMaxWidth = mainMaxWidthForPath(location.pathname);
    const activeSection = activeSectionForPath(location.pathname);
    return (<div className="app-shell min-h-screen" style={{ background: "var(--color-background)", color: "var(--color-text)" }}>
        <header className="app-topbar">
          <div className="app-topbar-inner" style={headerContentLayout}>
            <BrandLockup />
            {activeSection === "simulator" ? (<SimulatorSubnav pathname={location.pathname} placement="header"/>) : (<div className="app-context">
                <span>{sectionLabelForPath(location.pathname)}</span>
                <ChevronRight size={14}/>
                <span>{activeSection === "ontwikkeling" ? "Werkruimte" : "Dossiercockpit"}</span>
              </div>)}
            <div className="app-topbar-actions" aria-label="Contextacties">
              <span className="app-status-pill">Lokaal concept</span>
              <span className="app-chat-pill"><MessageCircle size={14}/> Chat</span>
            </div>
          </div>
        </header>

        <div className="app-body">
          <PrimaryRail pathname={location.pathname}/>
          <div className="app-content-column">
            {activeSection === "simulator" && <SimulatorSubnav pathname={location.pathname} placement="mobile"/>}
            {activeSection === "ontwikkeling" && <DevelopmentSubnav pathname={location.pathname}/>}
            <main className="app-main" style={{ maxWidth: mainMaxWidth, width: "100%", boxSizing: "border-box", margin: "0 auto", padding: "28px 28px" }}>
              <Routes>
                <Route path="/" element={<HomePage />}/>
                <Route path="/loonfiche" element={<LoonfichePage />}/>
                <Route path="/loonrun" element={<LoonrunPage />}/>
                <Route path="/loonmotor" element={<LoonmotorPage />}/>
                <Route path="/testcases" element={<TestcasesPage />}/>
                <Route path="/scope" element={<ScopePage />}/>
              </Routes>
            </main>
          </div>
        </div>

        <footer style={{
            borderTop: "1px solid var(--color-border)",
            background: "var(--color-surface)",
            padding: "16px 28px",
        }}>
          <div style={{ maxWidth: DEFAULT_CONTENT_MAX_WIDTH, margin: "0 auto", fontSize: 12, color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}>
            {APP_BRAND.footerCopy}
          </div>
        </footer>
        <MobileBottomNav pathname={location.pathname}/>
        <AiChatWidget />
      </div>);
}
function BrandLockup() {
    return (<div className="app-brand-lockup">
      <img src={APP_BRAND.logoSrc} alt={APP_BRAND.logoAlt} style={{ height: 34, width: "auto" }}/>
      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 850, color: "var(--color-text)", letterSpacing: 0 }}>
          {APP_BRAND.productLabel}
        </span>
        <span style={{ fontSize: 11, color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}>
          {APP_BRAND.subtitle}
        </span>
      </div>
    </div>);
}
export function PrimaryRail({ pathname }: {
    pathname: string;
}) {
    const active = activeSectionForPath(pathname);
    return (<aside className="app-primary-rail" aria-label="Hoofdnavigatie">
      <nav className="app-primary-rail-nav">
        {PRIMARY_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === active;
            return (<a key={item.id} href={hashHref(item.to)} aria-current={isActive ? "page" : undefined} className={`app-rail-link ${isActive ? "is-active" : ""}`}>
              <Icon size={18}/>
              <span>{item.label}</span>
            </a>);
        })}
      </nav>
      {active === "ontwikkeling" && <DevelopmentRailLinks />}
    </aside>);
}
function DevelopmentRailLinks() {
    return (<div className="app-rail-secondary" aria-label="Ontwikkeling links">
      {DEVELOPMENT_SUBNAV_ITEMS.map((item) => item.type === "route" ? (<a key={item.label} href={hashHref(item.to)} className="app-rail-secondary-link">
          {item.label}
        </a>) : (<a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" className="app-rail-secondary-link">
          {item.label}
        </a>))}
    </div>);
}
export function SimulatorSubnav({ pathname, placement = "mobile" }: {
    pathname: string;
    placement?: "header" | "mobile";
}) {
    const isHeader = placement === "header";
    return (<nav className={isHeader ? "app-header-subnav" : "app-subnav app-subnav-mobile"} aria-label="Simulator navigatie">
      <div className={isHeader ? "app-header-subnav-inner" : "app-subnav-inner"}>
        <span className="app-subnav-kicker"><Calculator size={14}/> Simulator</span>
        {SIMULATOR_SUBNAV_ITEMS.map((item) => (<a key={item.to} href={hashHref(item.to)} aria-current={pathname === item.to ? "page" : undefined} className={`app-subnav-link ${pathname === item.to ? "is-active" : ""}`}>
          {item.label}
        </a>))}
      </div>
    </nav>);
}
function DevelopmentSubnav({ pathname }: {
    pathname: string;
}) {
    return (<nav className="app-subnav" aria-label="Ontwikkeling navigatie">
      <div className="app-subnav-inner">
        <span className="app-subnav-kicker"><BookOpen size={14}/> Ontwikkeling</span>
        {DEVELOPMENT_SUBNAV_ITEMS.map((item) => item.type === "route" ? (<a key={item.label} href={hashHref(item.to)} aria-current={pathname === item.to ? "page" : undefined} className={`app-subnav-link ${pathname === item.to ? "is-active" : ""}`}>
            {item.label}
          </a>) : (<a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" className="app-subnav-link">
            {item.label}
          </a>))}
      </div>
    </nav>);
}
export function MobileBottomNav({ pathname }: {
    pathname: string;
}) {
    const active = activeSectionForPath(pathname);
    const items = [
        { id: "loonmotor" as const, to: "/loonmotor", label: "Loonmotor", icon: Building2 },
        { id: "simulator" as const, to: "/", label: "Simulator", icon: Calculator },
        { id: "ontwikkeling" as const, to: "/testcases", label: "Meer", icon: MoreHorizontal },
    ];
    return (<nav className="app-mobile-bottom-nav" aria-label="Mobiele hoofdnavigatie">
      {items.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === active;
            return (<a key={item.id} href={hashHref(item.to)} aria-current={isActive ? "page" : undefined} className={`app-mobile-nav-link ${isActive ? "is-active" : ""}`}>
          <Icon size={18}/>
          <span>{item.label}</span>
        </a>);
        })}
    </nav>);
}
function hashHref(to: string): string {
    return `#${to}`;
}
