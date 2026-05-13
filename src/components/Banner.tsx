export type BannerKind = "info" | "warning" | "error" | "success";

const STYLES: Record<BannerKind, React.CSSProperties> = {
  info: {
    background: "var(--color-info-soft)",
    border: "1px solid rgba(37,99,235,0.25)",
    color: "var(--color-navy-700)",
  },
  warning: {
    background: "#fffbeb",
    border: "1px solid #fcd34d",
    color: "#92400e",
  },
  error: {
    background: "#fff1f2",
    border: "1px solid #fca5a5",
    color: "#991b1b",
  },
  success: {
    background: "var(--color-mint-soft)",
    border: "1px solid rgba(28,210,163,0.35)",
    color: "var(--color-success-dark)",
  },
};

const ICON: Record<BannerKind, string> = {
  info: "ℹ",
  warning: "⚠",
  error: "✕",
  success: "✓",
};

export function Banner({
  kind,
  title,
  children,
}: {
  kind: BannerKind;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        borderRadius: "var(--radius-md)",
        padding: "12px 16px",
        fontSize: 13,
        fontFamily: "var(--font-body)",
        ...STYLES[kind],
      }}
    >
      <span style={{ fontWeight: 700 }}>{ICON[kind]}</span>
      <div style={{ flex: 1 }}>
        {title && <div style={{ fontWeight: 600, marginBottom: 2 }}>{title}</div>}
        <div>{children}</div>
      </div>
    </div>
  );
}
