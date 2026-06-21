import { Fragment } from "react";
import type { LoonficheRegel, LoonficheRegelType } from "@/lib/loonfiche";
import { formatEUR } from "@/lib/money";

const TYPE_HEADERS: Record<LoonficheRegelType, string> = {
    bruto: "Bruto",
    rsz: "Sociale bijdragen",
    belastbaar: "Belastbaar loon",
    bv: "Bedrijfsvoorheffing",
    inhouding: "Inhoudingen",
    netto: "Netto",
    werkgever: "Werkgever",
    informatief: "",
    subtotaal: "",
};

function tekenPrefix(teken: string): string {
    switch (teken) {
        case "min":
            return "−";
        default:
            return "";
    }
}

export function LoonficheTabel({ regels }: { regels: LoonficheRegel[] }) {
    let vorigeHeader = "";
    return (
        <table className="loonfiche-tabel">
            <thead>
                <tr>
                    <th>Code</th>
                    <th>Omschrijving</th>
                    <th>Bedrag</th>
                </tr>
            </thead>
            <tbody>
                {regels.map((regel) => {
                    const header = regel.type === "subtotaal" ? "" : TYPE_HEADERS[regel.type];
                    const showHeader = Boolean(header && header !== vorigeHeader);
                    if (header) vorigeHeader = header;
                    return (
                        <Fragment key={regel.code}>
                            {showHeader && (
                                <tr className="loonfiche-tabel-group-header">
                                    <td colSpan={3}>{header}</td>
                                </tr>
                            )}
                            <LoonficheRow regel={regel} />
                        </Fragment>
                    );
                })}
            </tbody>
        </table>
    );
}

function LoonficheRow({ regel }: { regel: LoonficheRegel }) {
    const isSubtotaal = regel.type === "subtotaal";
    const isTotaal = regel.code === "9000";
    const isBold = regel.bold || isTotaal;
    const prefix = tekenPrefix(regel.teken);
    return (
        <tr
            className={[
                "loonfiche-tabel-row",
                isSubtotaal ? "is-subtotaal" : "",
                isTotaal ? "is-totaal" : "",
                isBold ? "is-bold" : "",
            ].join(" ")}
        >
            <td className="loonfiche-tabel-code">{regel.code}</td>
            <td className="loonfiche-tabel-label">
                {regel.label}
                {regel.detail && (
                    <span className="loonfiche-tabel-detail">({regel.detail})</span>
                )}
            </td>
            <td className="loonfiche-tabel-bedrag">
                {prefix ? `${prefix} ${formatEUR(regel.bedrag)}` : formatEUR(regel.bedrag)}
            </td>
        </tr>
    );
}
