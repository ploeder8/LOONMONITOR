import type { Status, Tier } from "@/types/dataset";

const STATUS_STYLES: Record<Status, React.CSSProperties> = {
  actief:                 { background: "#f0fdf4", color: "#065f46", border: "1px solid #6ee7b7" },
  mogelijk_verouderd:     { background: "#fffbeb", color: "#92400e", border: "1px solid #fcd34d" },
  conflict:               { background: "#fff1f2", color: "#991b1b", border: "1px solid #fca5a5" },
  niet_gevonden:          { background: "#f5f0e8", color: "#5a5a59", border: "1px solid #e2ddd5" },
  gemarkeerd_voor_review: { background: "#fff7ed", color: "#9a3412", border: "1px solid #fdba74" },
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
  borderRadius: 4,
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
  "Tier 1": { background: "#e8dfcf", color: "#3c3c3b", border: "1px solid #cbbba0" },
  "Tier 2": { background: "#f5f0e8", color: "#7b6a58", border: "1px solid #cbbba0" },
  "Tier 3": { background: "#ffffff", color: "#9a8b7a", border: "1px solid #e2ddd5" },
};

export function TierBadge({ tier }: { tier: Tier }) {
  if (!tier) return null;
  return (
    <span style={{ ...BADGE_BASE, ...(TIER_STYLES[tier] ?? {}) }}>
      {tier}
    </span>
  );
}
