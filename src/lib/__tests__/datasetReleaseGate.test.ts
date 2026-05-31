import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import datasetJson from "@/data/pc200_payroll_dataset_2026.json";
import { ScopePage } from "@/pages/ScopePage";
import type { Datapunt, Dataset, Tier } from "@/types/dataset";
const dataset = datasetJson as Dataset;
const DATASET_CATEGORIEEN = [
    "lonen",
    "rsz",
    "fiscaliteit",
    "premies_en_voordelen",
    "arbeidsvoorwaarden",
] as const;
function alleDatapunten(): Datapunt[] {
    return DATASET_CATEGORIEEN.flatMap((categorie) => dataset[categorie]);
}
function heeftTekst(waarde: unknown): waarde is string {
    return typeof waarde === "string" && waarde.trim().length > 0;
}
function releaseGateMancoVoorActiefDatapunt(datapunt: Datapunt): string[] {
    const mancos: string[] = [];
    if (!heeftTekst(datapunt.id))
        mancos.push("id");
    if (datapunt.status !== "actief")
        mancos.push("status");
    if (!heeftTekst(datapunt.bron_url))
        mancos.push("bron_url");
    if (!heeftTekst(datapunt.bron_organisatie))
        mancos.push("bron_organisatie");
    if (!heeftTekst(datapunt.geldig_vanaf))
        mancos.push("geldig_vanaf");
    if (!heeftTekst(datapunt.bron_fragment))
        mancos.push("bron_fragment");
    if (!heeftTekst(datapunt.betrouwbaarheid))
        mancos.push("betrouwbaarheid.tier");
    return mancos;
}
function geldigeTriangulatieTiers(datapunt: Datapunt): Tier[] {
    return (datapunt.triangulatie_bronnen ?? [])
        .filter((bron) => heeftTekst(bron.bron) &&
        heeftTekst(bron.url) &&
        (bron.tier === "Tier 1" || bron.tier === "Tier 2"))
        .map((bron) => bron.tier);
}
function heeftVoldoendeTriangulatie(datapunt: Datapunt): boolean {
    const tiers = geldigeTriangulatieTiers(datapunt);
    return tiers.includes("Tier 1") || tiers.filter((tier) => tier === "Tier 2").length >= 2;
}
function telGedocumenteerdeDatapunten(markdown: string): number[] {
    return [...markdown.matchAll(/(\d+)\s+datapunten/g)].map((match) => Number(match[1]));
}
describe("dataset release-gate", () => {
    it("elk actief datapunt draagt volledige bronmetadata voor audit en release", () => {
        const mancos = alleDatapunten()
            .filter((datapunt) => datapunt.status === "actief")
            .flatMap((datapunt) => releaseGateMancoVoorActiefDatapunt(datapunt).map((veld) => `${datapunt.id}: ${veld}`));
        expect(mancos).toEqual([]);
    });
    it("Tier-3 datapunten zijn getrianguleerd met minstens een Tier-1 of twee Tier-2 bronnen", () => {
        const zonderGeldigeTriangulatie = alleDatapunten()
            .filter((datapunt) => datapunt.betrouwbaarheid === "Tier 3")
            .filter((datapunt) => !heeftVoldoendeTriangulatie(datapunt))
            .map((datapunt) => datapunt.id);
        expect(zonderGeldigeTriangulatie).toEqual([]);
    });
    it("dataset-aantallen in meta, README, AGENTS, DATASET_REFERENCE en ScopePage blijven synchroon", () => {
        const aantalDatapunten = alleDatapunten().length;
        const readme = readFileSync(new URL("../../../README.md", import.meta.url), "utf8");
        const agents = readFileSync(new URL("../../../AGENTS.md", import.meta.url), "utf8");
        const datasetReference = readFileSync(new URL("../../../knowledgebase/DATASET_REFERENCE.md", import.meta.url), "utf8");
        const scopeHtml = renderToStaticMarkup(createElement(ScopePage));
        expect(dataset.meta.datapunten_aantal).toBe(aantalDatapunten);
        expect(telGedocumenteerdeDatapunten(readme)).toContain(aantalDatapunten);
        expect(telGedocumenteerdeDatapunten(agents)).toContain(aantalDatapunten);
        expect(telGedocumenteerdeDatapunten(datasetReference)).toContain(aantalDatapunten);
        expect(scopeHtml).toContain("Datapunten");
        expect(scopeHtml).toContain(String(aantalDatapunten));
    });
});
