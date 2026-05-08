import type { Datapunt } from "@/types/dataset";
import { AuditPanel } from "@/components/AuditPanel";
import { formatEUR } from "@/lib/money";

export interface ResultCardProps {
  label: string;
  value?: string;
  amountEUR?: number;
  helper?: React.ReactNode;
  datapunten?: Datapunt[];
  highlight?: boolean;
}

export function ResultCard(props: ResultCardProps) {
  const valueDisplay =
    props.value ??
    (props.amountEUR !== undefined ? formatEUR(props.amountEUR) : "—");

  return (
    <div
      className={
        "flex flex-col gap-2 rounded-lg border bg-white p-4 shadow-sm " +
        (props.highlight ? "border-blue-400 ring-1 ring-blue-200" : "border-zinc-200")
      }
    >
      <div className="flex items-baseline justify-between gap-3">
        <div className="text-sm font-medium text-zinc-700">{props.label}</div>
        <div className="text-xl font-semibold tabular-nums text-zinc-950">
          {valueDisplay}
        </div>
      </div>
      {props.helper && <div className="text-xs text-zinc-500">{props.helper}</div>}
      {props.datapunten && props.datapunten.length > 0 && (
        <div className="mt-1 flex flex-col gap-1">
          {props.datapunten.map((dp) => (
            <AuditPanel key={dp.id} datapunt={dp} />
          ))}
        </div>
      )}
    </div>
  );
}
