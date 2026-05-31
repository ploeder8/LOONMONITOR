export function round2(x: number): number {
    return Number(Math.round(Number(`${x}e2`)) + "e-2");
}
export function formatEUR(x: number): string {
    return new Intl.NumberFormat("nl-BE", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(x);
}
