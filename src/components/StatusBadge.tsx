import type { Status, Tier } from "@/types/dataset";
import { cn } from "@/lib/cn";

const STATUS_STYLES: Record<Status, string> = {
  actief: "bg-emerald-100 text-emerald-900 border-emerald-300",
  mogelijk_verouderd: "bg-amber-100 text-amber-900 border-amber-300",
  conflict: "bg-rose-100 text-rose-900 border-rose-300",
  niet_gevonden: "bg-zinc-200 text-zinc-700 border-zinc-300",
  gemarkeerd_voor_review: "bg-orange-100 text-orange-900 border-orange-300",
};

const STATUS_LABEL: Record<Status, string> = {
  actief: "actief",
  mogelijk_verouderd: "mogelijk verouderd",
  conflict: "conflict",
  niet_gevonden: "niet gevonden",
  gemarkeerd_voor_review: "review nodig",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        STATUS_STYLES[status],
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

export function TierBadge({ tier }: { tier: Tier }) {
  if (!tier) return null;
  const cls =
    tier === "Tier 1"
      ? "bg-blue-100 text-blue-900 border-blue-300"
      : tier === "Tier 2"
        ? "bg-indigo-100 text-indigo-900 border-indigo-300"
        : "bg-purple-100 text-purple-900 border-purple-300";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        cls,
      )}
    >
      {tier}
    </span>
  );
}
