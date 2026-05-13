import { cn } from "@/lib/cn";

export function FormField({
  label,
  htmlFor,
  helper,
  children,
}: {
  label: string;
  htmlFor?: string;
  helper?: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="flex flex-col gap-1 text-sm">
      <span className="font-medium" style={{ color: "var(--color-text)", fontFamily: "var(--font-body)" }}>
        {label}
      </span>
      {children}
      {helper && <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>{helper}</span>}
    </label>
  );
}

export const inputClass = cn(
  "rounded-[12px] border bg-white px-3 py-2 text-sm w-full text-[var(--color-text)]",
  "focus:outline-none focus:ring-2",
  "border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-[rgba(216,58,24,0.16)]",
);
export const selectClass = inputClass;
