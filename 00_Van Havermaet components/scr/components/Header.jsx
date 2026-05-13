import { NavLink } from "react-router-dom";

const VH = {
  charcoal: "#3c3c3b",
  charcoalLight: "#5a5a59",
  sand: "#cbbba0",
  white: "#ffffff",
};

export default function Header({
  tools,
  logoSrc = "/vh-logo.svg",
  brandLabel = "Van Havermaet · Family Office",
  colors = VH,
}) {
  return (
    <header
      style={{
        background: colors.white,
        borderBottom: `3px solid ${colors.sand}`,
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
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <NavLink
          to={tools[0].path}
          aria-label={brandLabel}
          style={{
            display: "flex",
            alignItems: "center",
            textDecoration: "none",
          }}
        >
          <img
            src={logoSrc}
            alt={brandLabel}
            style={{
              height: 34,
              width: "auto",
              display: "block",
            }}
          />
        </NavLink>

        <nav style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {tools.map((t) => (
            <NavLink
              key={t.path}
              to={t.path}
              style={({ isActive }) => ({
                padding: "8px 14px",
                fontSize: 13,
                fontWeight: 600,
                color: isActive ? colors.charcoal : colors.charcoalLight,
                background: isActive ? colors.sand : "transparent",
                borderRadius: 4,
                textDecoration: "none",
                fontFamily: "var(--font-body)",
                letterSpacing: "0.01em",
                transition: "background 0.15s, color 0.15s",
              })}
            >
              {t.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
