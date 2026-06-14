import { AlertTriangle } from "lucide-react";
import { AuditSourceGroup } from "@/components/AuditPanel";
import type { Loonfiche, LoonficheRegel } from "@/lib/loonfiche";
import { formatEUR } from "@/lib/money";
import { LoonficheTabel } from "./LoonficheTabel";

interface LoonficheDocumentProps {
    loonfiche: Loonfiche;
    toonBronnen?: boolean;
}

function formatDateBE(d: Date): string {
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
}

function periodeVanTot(jaar: string, maand: string): string {
    const y = Number(jaar);
    const m = Number(maand);
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0);
    return `periode van ${formatDateBE(start)} tot ${formatDateBE(end)}`;
}

export function LoonficheDocument({ loonfiche, toonBronnen = true }: LoonficheDocumentProps) {
    const strookRegels = loonfiche.regels.filter((r) => r.type !== "werkgever");
    const auditRegels = strookRegels.filter((r) => r.datapunten && r.datapunten.length > 0);
    const p = loonfiche.profielSnapshot;
    const statuutLabel = loonfiche.isStudent ? "Student" : "Bediende";
    const tewerkstellingsbreukPct = Math.round(p.tewerkstellingsbreuk * 100);

    return (
        <div className="loonfiche-document">
            <div className="loonfiche-simulatie-banner">
                SIMULATIE – geen officiële loonfiche
            </div>

            <div className="loonfiche-content">
                <header className="loonfiche-payslip-header">
                    <div className="loonfiche-employer-block">
                        <div className="loonfiche-employer-name">{p.werkgeverNaam || "—"}</div>
                        <div>{p.werkgeverStraat} {p.werkgeverHuisnummer}</div>
                        <div>{p.werkgeverPostcode} {p.werkgeverGemeente}</div>
                    </div>
                    <div className="loonfiche-title-block">
                        <div className="loonfiche-title">LOONSTROOK</div>
                        <div className="loonfiche-periode">
                            {periodeVanTot(p.berekeningsJaar, p.berekeningsMaand)}
                        </div>
                        <div className="loonfiche-subtitle">
                            uittreksel van de individuele rekening, zorgvuldig bewaren
                        </div>
                    </div>
                </header>

                <div className="loonfiche-meta-grid">
                    <MetaGroup title="referte" rows={[{ label: "referte", value: p.werknemerReferentie }]} />
                    <div className="loonfiche-employee-name">
                        <div className="loonfiche-meta-value-large">{p.werknemerNaam || "—"}</div>
                    </div>

                    <MetaGroup
                        title="onderneming"
                        rows={[
                            { label: "ondernemingsnummer", value: p.werkgeverOndernemingsnummer },
                            { label: "RSZ-nummer", value: "—" },
                        ]}
                    />
                    <MetaGroup
                        title="persoonlijke gegevens"
                        rows={[
                            { label: "rijksregisternummer", value: p.werknemerRijksregister },
                            { label: "burgerlijke staat", value: "—" },
                            { label: "ten laste", value: String(p.kinderenTenLaste) },
                        ]}
                    />
                    <MetaGroup
                        title="contractgegevens"
                        rows={[
                            { label: "paritair comité", value: "PC 200" },
                            { label: "statuut", value: statuutLabel },
                            { label: "datum in dienst", value: "—" },
                            { label: "plaats tewerkstelling", value: "—" },
                            { label: "basisloon", value: formatEUR(loonfiche.totalen.cashBrutoloon) },
                            { label: "looncategorie", value: `Schaal ${p.schaal} – cat ${p.cat}` },
                            { label: "tewerkstellingsbreuk", value: `${tewerkstellingsbreukPct} / 100` },
                        ]}
                    />
                </div>

                {loonfiche.waarschuwingen.length > 0 && (
                    <div className="loonfiche-waarschuwingen">
                        {loonfiche.waarschuwingen.map((w, i) => (
                            <div key={i} className="loonfiche-waarschuwing">
                                <AlertTriangle size={14} />
                                {w}
                            </div>
                        ))}
                    </div>
                )}

                <LoonficheTabel regels={strookRegels} />

                <div className="loonfiche-netto-block">
                    <div className="loonfiche-netto-label">Netto te betalen</div>
                    <div className="loonfiche-netto-value">
                        {formatEUR(loonfiche.totalen.nettoTeBetalen)}
                    </div>
                </div>

                {toonBronnen && auditRegels.length > 0 && (
                    <div className="loonfiche-audit">
                        <div className="loonfiche-audit-title">Bronvermelding</div>
                        <div className="loonfiche-audit-list">
                            {auditRegels.map((regel) => (
                                <AuditRegelBlock key={regel.code} regel={regel} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function MetaGroup({
    title,
    rows,
}: {
    title: string;
    rows: Array<{ label: string; value: string }>;
}) {
    return (
        <div className="loonfiche-meta-group">
            <div className="loonfiche-meta-group-title">{title}</div>
            <div className="loonfiche-meta-rows">
                {rows.map((row) => (
                    <div key={row.label} className="loonfiche-meta-row">
                        <span className="loonfiche-meta-label">{row.label}</span>
                        <span className="loonfiche-meta-value">{row.value || "—"}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function AuditRegelBlock({ regel }: { regel: LoonficheRegel }) {
    if (!regel.datapunten || regel.datapunten.length === 0) return null;
    return (
        <div className="loonfiche-audit-regel">
            <div className="loonfiche-audit-regel-title">
                {regel.code} — {regel.label}
            </div>
            <AuditSourceGroup datapunten={regel.datapunten} />
        </div>
    );
}
