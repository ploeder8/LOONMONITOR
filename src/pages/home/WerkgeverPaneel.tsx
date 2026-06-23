import { useState } from "react";
import { Building2, Loader2, Search, Shield } from "lucide-react";
import { Banner } from "@/components/Banner";
import { CockpitAccordion } from "@/components/CockpitAccordion";
import { CockpitCard } from "@/components/CockpitCard";
import { FormField, inputClass, selectClass } from "@/components/Field";
import type { Profiel } from "@/lib/profiel";
import { fetchKboHtml, isValidKboNumber, normalizeKboNumber, parseKboPage } from "@/lib/kbo";
import { MAALTIJDCHEQUE_MAX_WG_PER_DAG_2026, type DoelgroepverminderingEersteAanwervingen } from "@/lib/werkgeverskost";
import { HelpTooltip, NumeriekeInput } from "@/pages/home/FormControls";
import type { ProfielSetter } from "@/pages/home/types";

const DOELGROEPVERMINDERING_OPMERKING = "de doelgroepvermindering kan echter enkel toegepast worden indien de onderneming daadwerkelijk extra werkgelegenheid creeert , waarbij rekening gehouden wordt met bestaande/voorafgaande tewerkstellingen in andere vennootschappen waarmee de nieuwe onderneming verbonden is";

export function WerkgeverCard({ profiel, set, cardStyle, compact }: {
    profiel: Profiel;
    set: ProfielSetter;
    cardStyle?: import("react").CSSProperties;
    compact?: boolean;
}) {
    const [kboInput, setKboInput] = useState(profiel.werkgeverOndernemingsnummer);
    const [kboStatus, setKboStatus] = useState<{ kind: "idle" | "loading" | "error"; message?: string }>({ kind: "idle" });

    async function haalKboOp() {
        const normalized = normalizeKboNumber(kboInput);
        if (!isValidKboNumber(normalized)) {
            setKboStatus({ kind: "error", message: "Geen geldig Belgisch ondernemingsnummer." });
            return;
        }
        setKboStatus({ kind: "loading" });
        try {
            const result = await fetchKboHtml(normalized);
            if (!result.ok) {
                setKboStatus({ kind: "error", message: `KBO-gegevens konden niet opgehaald worden (status ${result.status}).` });
                return;
            }
            const parsed = parseKboPage(result.html);
            if (!parsed.name && !parsed.address.street) {
                setKboStatus({ kind: "error", message: "Geen onderneming gevonden voor dit nummer." });
                return;
            }
            set((prev) => ({
                ...prev,
                werkgeverOndernemingsnummer: normalized,
                werkgeverNaam: parsed.name,
                werkgeverStraat: parsed.address.street,
                werkgeverHuisnummer: parsed.address.houseNr,
                werkgeverPostcode: parsed.address.zip,
                werkgeverGemeente: parsed.address.city,
            }));
            setKboStatus({ kind: "idle" });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Onbekende fout bij ophalen KBO-gegevens.";
            setKboStatus({ kind: "error", message });
        }
    }

    return (
        <CockpitCard title="Werkgever" icon={<Building2 size={16}/>} style={cardStyle}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {compact ? (<>
                    <div style={{ display: "grid", gap: 12, gridTemplateColumns: "minmax(140px, 1fr) 2fr", alignItems: "flex-end" }}>
                        <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
                            <FormField label={<>KBO-nummer <HelpTooltip text="Voer een Belgisch ondernemingsnummer in. Bij geldig nummer worden naam en adres automatisch ingevuld."/></>}>
                                <input
                                    type="text"
                                    value={kboInput}
                                    onChange={(e) => setKboInput(normalizeKboNumber(e.target.value))}
                                    className={inputClass}
                                    placeholder="bv. 0123.456.789"
                                />
                            </FormField>
                            <button
                                type="button"
                                onClick={haalKboOp}
                                disabled={kboStatus.kind === "loading"}
                                aria-label="KBO-gegevens ophalen"
                                title="KBO-gegevens ophalen"
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: 34,
                                    height: 34,
                                    flexShrink: 0,
                                    borderRadius: "var(--radius-md)",
                                    border: "1px solid var(--color-primary-border)",
                                    background: "var(--color-primary)",
                                    color: "#ffffff",
                                    cursor: kboStatus.kind === "loading" ? "not-allowed" : "pointer",
                                    opacity: kboStatus.kind === "loading" ? 0.7 : 1,
                                }}
                            >
                                {kboStatus.kind === "loading" ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }}/> : <Search size={14}/>}
                            </button>
                        </div>
                        <FormField label="Naam werkgever">
                            <input
                                type="text"
                                value={profiel.werkgeverNaam}
                                onChange={(e) => set("werkgeverNaam", e.target.value)}
                                className={inputClass}
                                placeholder="bv. Acme BV"
                            />
                        </FormField>
                    </div>

                    {kboStatus.kind === "error" && <Banner kind="error" title="KBO-ophaal mislukt">{kboStatus.message}</Banner>}

                    <div style={{
                        display: "grid",
                        gap: 12,
                        gridTemplateColumns: "2fr 90px 90px 2fr",
                    }}>
                        <FormField label="Straat">
                            <input
                                type="text"
                                value={profiel.werkgeverStraat}
                                onChange={(e) => set("werkgeverStraat", e.target.value)}
                                className={inputClass}
                                placeholder="bv. Kerkstraat"
                            />
                        </FormField>
                        <FormField label="Huisnummer">
                            <input
                                type="text"
                                value={profiel.werkgeverHuisnummer}
                                onChange={(e) => set("werkgeverHuisnummer", e.target.value)}
                                className={inputClass}
                                placeholder="bv. 12 bus A"
                            />
                        </FormField>
                        <FormField label="Postcode">
                            <input
                                type="text"
                                value={profiel.werkgeverPostcode}
                                onChange={(e) => set("werkgeverPostcode", e.target.value)}
                                className={inputClass}
                                placeholder="bv. 2000"
                            />
                        </FormField>
                        <FormField label="Gemeente">
                            <input
                                type="text"
                                value={profiel.werkgeverGemeente}
                                onChange={(e) => set("werkgeverGemeente", e.target.value)}
                                className={inputClass}
                                placeholder="bv. Antwerpen"
                            />
                        </FormField>
                    </div>
                </>) : (<>
                    <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 12, alignItems: "flex-end" }}>
                        <FormField label={<>KBO-nummer <HelpTooltip text="Voer een Belgisch ondernemingsnummer in. Bij geldig nummer worden naam en adres automatisch ingevuld."/></>}>
                            <input
                                type="text"
                                value={kboInput}
                                onChange={(e) => setKboInput(normalizeKboNumber(e.target.value))}
                                className={inputClass}
                                placeholder="bv. 0123.456.789"
                            />
                        </FormField>
                        <button
                            type="button"
                            onClick={haalKboOp}
                            disabled={kboStatus.kind === "loading"}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 6,
                                padding: "7px 12px",
                                fontSize: 12,
                                fontWeight: 600,
                                borderRadius: "var(--radius-md)",
                                border: "1px solid var(--color-primary-border)",
                                background: "var(--color-primary)",
                                color: "#ffffff",
                                cursor: kboStatus.kind === "loading" ? "not-allowed" : "pointer",
                                fontFamily: "var(--font-body)",
                                opacity: kboStatus.kind === "loading" ? 0.7 : 1,
                            }}
                        >
                            {kboStatus.kind === "loading" ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }}/> : <Search size={14}/>}
                            Ophalen
                        </button>
                    </div>

                    {kboStatus.kind === "error" && <Banner kind="error" title="KBO-ophaal mislukt">{kboStatus.message}</Banner>}

                    <FormField label="Naam werkgever">
                        <input
                            type="text"
                            value={profiel.werkgeverNaam}
                            onChange={(e) => set("werkgeverNaam", e.target.value)}
                            className={inputClass}
                            placeholder="bv. Acme BV"
                        />
                    </FormField>

                    <div style={{
                        display: "grid",
                        gap: 12,
                        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                    }}>
                        <FormField label="Straat">
                            <input
                                type="text"
                                value={profiel.werkgeverStraat}
                                onChange={(e) => set("werkgeverStraat", e.target.value)}
                                className={inputClass}
                                placeholder="bv. Kerkstraat"
                            />
                        </FormField>
                        <FormField label="Huisnummer">
                            <input
                                type="text"
                                value={profiel.werkgeverHuisnummer}
                                onChange={(e) => set("werkgeverHuisnummer", e.target.value)}
                                className={inputClass}
                                placeholder="bv. 12 bus A"
                            />
                        </FormField>
                        <FormField label="Postcode">
                            <input
                                type="text"
                                value={profiel.werkgeverPostcode}
                                onChange={(e) => set("werkgeverPostcode", e.target.value)}
                                className={inputClass}
                                placeholder="bv. 2000"
                            />
                        </FormField>
                        <FormField label="Gemeente">
                            <input
                                type="text"
                                value={profiel.werkgeverGemeente}
                                onChange={(e) => set("werkgeverGemeente", e.target.value)}
                                className={inputClass}
                                placeholder="bv. Antwerpen"
                            />
                        </FormField>
                    </div>
                </>)}
            </div>
        </CockpitCard>
    );
}

export function WerkgeversbijdragenAccordion({ profiel, set, layout = "default" }: {
    profiel: Profiel;
    set: ProfielSetter;
    layout?: "default" | "simulator2";
}) {
    return (
        <CockpitAccordion title="Werkgeversbijdragen" subtitle="Arbeidsongevallen, groepsverzekering, hospitalisatie" icon={<Shield size={16}/>}>
            <WerkgeversbijdragenContent profiel={profiel} set={set} layout={layout}/>
        </CockpitAccordion>
    );
}

export function WerkgeverPaneel({ profiel, set }: {
    profiel: Profiel;
    set: ProfielSetter;
}) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--cockpit-grid-gap)" }}>
            <WerkgeverCard profiel={profiel} set={set}/>
            <WerkgeversbijdragenAccordion profiel={profiel} set={set}/>
        </div>
    );
}

function WerkgeversbijdragenContent({ profiel, set, layout = "default" }: {
    profiel: Profiel;
    set: ProfielSetter;
    layout?: "default" | "simulator2";
}) {
    if (layout === "simulator2") {
        return (
            <div className="simulator2-werkgever-grid">
                <CockpitCard icon={null} style={{ height: "100%" }}>
                    <FormField label={<>Arbeidsongevallen (%) <HelpTooltip text="Burelen: ~0,3%. Controleer uw polis."/></>}>
                        <NumeriekeInput
                            className={inputClass}
                            step="0.01"
                            min={0}
                            max={10}
                            value={profiel.arbeidsongevallenPct * 100}
                            formatValue={(waarde) => waarde.toFixed(2)}
                            onValueChange={(waarde) => set("arbeidsongevallenPct", waarde / 100)}
                        />
                    </FormField>
                </CockpitCard>
                <CockpitCard icon={null} style={{ height: "100%" }}>
                    <FormField label="Patronale groepsverzekering (€/m)">
                        <NumeriekeInput
                            className={inputClass}
                            step="0.01"
                            min={0}
                            value={profiel.extraGroepsverzekering}
                            onValueChange={(waarde) => set("extraGroepsverzekering", waarde)}
                        />
                    </FormField>
                </CockpitCard>
                <CockpitCard icon={null} style={{ height: "100%" }}>
                    <FormField label="Hospitalisatieverzekering (€/m)">
                        <NumeriekeInput
                            className={inputClass}
                            step="0.01"
                            min={0}
                            value={profiel.extraHospitalisatie}
                            onValueChange={(waarde) => set("extraHospitalisatie", waarde)}
                        />
                    </FormField>
                </CockpitCard>
                <CockpitCard icon={null} style={{ height: "100%" }}>
                    <FormField label={<>Doelgroepvermindering eerste aanwervingen <HelpTooltip text="Programmawet 30 mei 2026: vanaf 1 juli 2026 maximaal €2.000/kwartaal voor de eerste werknemer en €1.000/kwartaal voor werknemers 2 tot 5 binnen het toepassingsvenster."/></>}>
                        <select
                            className={selectClass}
                            value={profiel.doelgroepverminderingEersteAanwervingen}
                            onChange={(e) => set("doelgroepverminderingEersteAanwervingen", e.target.value as DoelgroepverminderingEersteAanwervingen)}
                            style={{ width: "100%" }}
                        >
                            <option value="geen">Geen doelgroepvermindering</option>
                            <option value="eerste_werknemer">Eerste werknemer - max. €2.000/kwartaal</option>
                            <option value="tweede_tot_vijfde_werknemer">Tweede tot vijfde werknemer - max. €1.000/kwartaal</option>
                        </select>
                    </FormField>
                    {profiel.doelgroepverminderingEersteAanwervingen !== "geen" && (
                        <Banner kind="warning" title="Voorwaarde doelgroepvermindering">
                            {DOELGROEPVERMINDERING_OPMERKING}
                        </Banner>
                    )}
                </CockpitCard>
            </div>
        );
    }
    return (
        <div style={{ display: "grid", gap: 16 }}>
            <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 16 }}>
                <FormField label={<>Arbeidsongevallen (%) <HelpTooltip text="Burelen: ~0,3%. Controleer uw polis."/></>}>
                    <NumeriekeInput
                        className={inputClass}
                        step="0.01"
                        min={0}
                        max={10}
                        value={profiel.arbeidsongevallenPct * 100}
                        formatValue={(waarde) => waarde.toFixed(2)}
                        onValueChange={(waarde) => set("arbeidsongevallenPct", waarde / 100)}
                    />
                </FormField>
                <FormField label="Patronale groepsverzekering (€/m)">
                    <NumeriekeInput
                        className={inputClass}
                        step="0.01"
                        min={0}
                        value={profiel.extraGroepsverzekering}
                        onValueChange={(waarde) => set("extraGroepsverzekering", waarde)}
                    />
                </FormField>
                <FormField label="Hospitalisatieverzekering (€/m)">
                    <NumeriekeInput
                        className={inputClass}
                        step="0.01"
                        min={0}
                        value={profiel.extraHospitalisatie}
                        onValueChange={(waarde) => set("extraHospitalisatie", waarde)}
                    />
                </FormField>
            </div>
            <FormField label={<>Doelgroepvermindering eerste aanwervingen <HelpTooltip text="Programmawet 30 mei 2026: vanaf 1 juli 2026 maximaal €2.000/kwartaal voor de eerste werknemer en €1.000/kwartaal voor werknemers 2 tot 5 binnen het toepassingsvenster."/></>}>
                <select
                    className={selectClass}
                    value={profiel.doelgroepverminderingEersteAanwervingen}
                    onChange={(e) => set("doelgroepverminderingEersteAanwervingen", e.target.value as DoelgroepverminderingEersteAanwervingen)}
                    style={{ width: "100%" }}
                >
                    <option value="geen">Geen doelgroepvermindering</option>
                    <option value="eerste_werknemer">Eerste werknemer - max. €2.000/kwartaal</option>
                    <option value="tweede_tot_vijfde_werknemer">Tweede tot vijfde werknemer - max. €1.000/kwartaal</option>
                </select>
            </FormField>
            {profiel.doelgroepverminderingEersteAanwervingen !== "geen" && (
                <Banner kind="warning" title="Voorwaarde doelgroepvermindering">
                    {DOELGROEPVERMINDERING_OPMERKING}
                </Banner>
            )}
        </div>
    );
}

