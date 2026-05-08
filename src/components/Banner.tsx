import { cn } from "@/lib/cn";

export type BannerKind = "info" | "warning" | "error" | "success";

const STYLES: Record<BannerKind, string> = {
  info: "bg-blue-50 border-blue-300 text-blue-900",
  warning: "bg-amber-50 border-amber-300 text-amber-900",
  error: "bg-rose-50 border-rose-300 text-rose-900",
  success: "bg-emerald-50 border-emerald-300 text-emerald-900",
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
    <div className={cn("flex gap-3 rounded-md border px-4 py-3 text-sm", STYLES[kind])}>
      <span className="font-bold">{ICON[kind]}</span>
      <div className="flex-1">
        {title && <div className="font-semibold">{title}</div>}
        <div>{children}</div>
      </div>
    </div>
  );
}
