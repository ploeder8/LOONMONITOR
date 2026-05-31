import type { Datapunt } from "@/types/dataset";
export function BronLink({ datapunt }: {
    datapunt: Datapunt;
}) {
    if (!datapunt.bron_url) {
        return (<span className="text-xs italic text-[var(--color-text-muted)]">geen bron-URL</span>);
    }
    return (<a href={datapunt.bron_url} target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--color-primary)] underline decoration-dotted hover:text-[var(--color-primary-hover)]" title={datapunt.bron_titel ?? datapunt.bron_url}>
      {datapunt.bron_organisatie ?? "Bron"} ↗
    </a>);
}
