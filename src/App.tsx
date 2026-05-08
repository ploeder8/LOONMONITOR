import { HashRouter, NavLink, Route, Routes } from "react-router-dom";
import { HomePage } from "@/pages/HomePage";
import { ScopePage } from "@/pages/ScopePage";
import { TestcasesPage } from "@/pages/TestcasesPage";

export function App() {
  return (
    <HashRouter>
      <div className="min-h-screen bg-zinc-50 text-zinc-900">
        <header className="border-b border-zinc-200 bg-white">
          <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-4">
            <div className="flex flex-col">
              <span className="text-base font-semibold">PC 200 Loonmonitor</span>
              <span className="text-xs text-zinc-500">
                Proof-of-concept — dataset 2026
              </span>
            </div>
            <nav className="ml-auto flex gap-1 text-sm">
              <NavItem to="/" label="Profiel" />
              <NavItem to="/testcases" label="Testcases" />
              <NavItem to="/scope" label="Scope &amp; bekend manco" />
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-6">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/testcases" element={<TestcasesPage />} />
            <Route path="/scope" element={<ScopePage />} />
          </Routes>
        </main>
        <footer className="border-t border-zinc-200 bg-white px-6 py-4 text-xs text-zinc-500">
          <div className="mx-auto max-w-6xl">
            POC — PC 200 Loonmonitor. Geen vervanging voor sociaal secretariaat.
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
      className={({ isActive }) =>
        "rounded px-3 py-1.5 " +
        (isActive
          ? "bg-blue-100 font-semibold text-blue-900"
          : "text-zinc-700 hover:bg-zinc-100")
      }
    >
      {label}
    </NavLink>
  );
}
