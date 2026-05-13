export type BannerKind = "info" | "warning" | "error" | "success";

const STYLES: Record<BannerKind, React.CSSProperties> = {
  info: {
    background: "#f5f0e8",
    border: "1px solid #cbbba0",
    color: "#3c3c3b",
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
    background: "#f0fdf4",
    border: "1px solid #6ee7b7",
    color: "#065f46",
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
        borderRadius: 8,
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
