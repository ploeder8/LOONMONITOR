// Standard rounding to 2 decimals — the testcases require plain Math.round
// behaviour (banker's rounding is explicitly NOT required per
// pc200_payroll_testcases_2026.md §Conventies).

export function round2(x: number): number {
  // Multiply/divide trick is sensitive to FP error for inputs like 1.005;
  // a more robust rounding via toFixed avoids the worst cases.
  return Number(Math.round(Number(`${x}e2`)) + "e-2");
}

export function formatEUR(x: number): string {
  // Belgian format: "€ 1.234,56"
  return new Intl.NumberFormat("nl-BE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(x);
}
