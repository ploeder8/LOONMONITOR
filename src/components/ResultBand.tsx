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
          borderRadius: "var(--radius-md)",
          background: "var(--color-navy-50)",
          border: "1px solid var(--color-navy-100)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {icon && <span style={{ color: "var(--color-primary)", display: "inline-flex" }}>{icon}</span>}
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 14,
              fontWeight: 800,
              color: "var(--color-text)",
              letterSpacing: 0,
              margin: 0,
              textTransform: "uppercase",
            }}
          >
            {title}
          </h3>
        </div>
        {subtitle && (
          <span style={{ fontSize: 11, color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}>
            {subtitle}
          </span>
        )}
      </header>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{children}</div>
    </section>
  );
}
