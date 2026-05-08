import type { Datapunt } from "@/types/dataset";

export function BronLink({ datapunt }: { datapunt: Datapunt }) {
  if (!datapunt.bron_url) {
    return (
      <span className="text-xs text-zinc-500 italic">geen bron-URL</span>
    );
  }
  return (
    <a
      href={datapunt.bron_url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-xs text-blue-700 underline decoration-dotted hover:text-blue-900"
      title={datapunt.bron_titel ?? datapunt.bron_url}
    >
      {datapunt.bron_organisatie ?? "Bron"} ↗
    </a>
  );
}
