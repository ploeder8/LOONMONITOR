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
      <span className="font-medium" style={{ color: "#3c3c3b", fontFamily: "var(--font-body)" }}>
        {label}
      </span>
      {children}
      {helper && <span className="text-xs" style={{ color: "#9a8b7a" }}>{helper}</span>}
    </label>
  );
}

export const inputClass = cn(
  "rounded-[8px] border bg-white px-3 py-2 text-sm w-full text-[#3c3c3b]",
  "focus:outline-none focus:ring-2",
  "border-[#e2ddd5] focus:border-[#7b6a58] focus:ring-[rgba(123,106,88,0.2)]",
);
export const selectClass = inputClass;
