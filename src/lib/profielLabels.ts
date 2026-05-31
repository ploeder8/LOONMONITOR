import type { Profiel } from "@/lib/profiel";
export const MAANDNAMEN = [
    "januari",
    "februari",
    "maart",
    "april",
    "mei",
    "juni",
    "juli",
    "augustus",
    "september",
    "oktober",
    "november",
    "december",
];
export function maandLabel(maand: string): string {
    return MAANDNAMEN[parseInt(maand, 10) - 1] ?? maand;
}
export function profielPeriodeLabel(profiel: Pick<Profiel, "berekeningsMaand" | "berekeningsJaar">): string {
    return `${maandLabel(profiel.berekeningsMaand)} ${profiel.berekeningsJaar}`;
}
export function generatieDatumLabel(datum = new Date()): string {
    return datum.toLocaleDateString("nl-BE", { day: "numeric", month: "long", year: "numeric" });
}
export function statuutLabel(profiel: Pick<Profiel, "statuut" | "tewerkstellingsbreuk">): string {
    return `${profiel.statuut === "student" ? "Student" : "Bediende"}${profiel.tewerkstellingsbreuk < 1 ? ` · ${Math.round(profiel.tewerkstellingsbreuk * 100)}%` : ""}`;
}
