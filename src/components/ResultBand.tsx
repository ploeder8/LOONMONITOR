export function ResultBand({
  id,
  title,
  subtitle,
  icon,
  children,
}: {
  id: string;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        scrollMarginTop: 140,
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 10,
          padding: "6px 10px",
          borderRadius: 6,
          background: "#f5f0e8",
          border: "1px solid #e8dfcf",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {icon && <span style={{ color: "#7b6a58", display: "inline-flex" }}>{icon}</span>}
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 14,
              fontWeight: 600,
              color: "#3c3c3b",
              letterSpacing: "-0.01em",
              margin: 0,
              textTransform: "uppercase",
            }}
          >
            {title}
          </h3>
        </div>
        {subtitle && (
          <span style={{ fontSize: 11, color: "#9a8b7a", fontFamily: "var(--font-body)" }}>
            {subtitle}
          </span>
        )}
      </header>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{children}</div>
    </section>
  );
}
