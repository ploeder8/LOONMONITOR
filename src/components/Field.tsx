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
      <span className="font-medium text-zinc-800">{label}</span>
      {children}
      {helper && <span className="text-xs text-zinc-500">{helper}</span>}
    </label>
  );
}

export const inputClass = cn(
  "rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm",
  "focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200",
);
export const selectClass = inputClass;
