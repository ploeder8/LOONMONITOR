import type { Status, Tier } from "@/types/dataset";

const STATUS_STYLES: Record<Status, React.CSSProperties> = {
  actief:                 { background: "var(--color-mint-soft)", color: "var(--color-success-dark)", border: "1px solid rgba(28,210,163,0.35)" },
  mogelijk_verouderd:     { background: "#fffbeb", color: "#92400e", border: "1px solid #fcd34d" },
  conflict:               { background: "#fff1f2", color: "#991b1b", border: "1px solid #fca5a5" },
  niet_gevonden:          { background: "var(--color-navy-50)", color: "var(--color-navy-500)", border: "1px solid var(--color-border)" },
  gemarkeerd_voor_review: { background: "var(--color-primary-soft)", color: "var(--color-primary)", border: "1px solid var(--color-primary-border)" },
};

const STATUS_LABEL: Record<Status, string> = {
  actief:                 "actief",
  mogelijk_verouderd:     "mogelijk verouderd",
  conflict:               "conflict",
  niet_gevonden:          "niet gevonden",
  gemarkeerd_voor_review: "review nodig",
};

const BADGE_BASE: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  borderRadius: "var(--radius-pill)",
  padding: "1px 7px",
  fontSize: 11,
  fontWeight: 600,
  fontFamily: "var(--font-body)",
  whiteSpace: "nowrap",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span style={{ ...BADGE_BASE, ...STATUS_STYLES[status] }}>
      {STATUS_LABEL[status]}
    </span>
  );
}

const TIER_STYLES: Record<string, React.CSSProperties> = {
  "Tier 1": { background: "var(--color-primary-soft)", color: "var(--color-primary)", border: "1px solid var(--color-primary-border)" },
  "Tier 2": { background: "var(--color-navy-50)", color: "var(--color-navy-700)", border: "1px solid var(--color-navy-100)" },
  "Tier 3": { background: "var(--color-surface)", color: "var(--color-text-muted)", border: "1px solid var(--color-border)" },
};

export function TierBadge({ tier }: { tier: Tier }) {
  if (!tier) return null;
  return (
    <span style={{ ...BADGE_BASE, ...(TIER_STYLES[tier] ?? {}) }}>
      {tier}
    </span>
  );
}
