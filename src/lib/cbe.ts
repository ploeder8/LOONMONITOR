export interface CbeEnterpriseResult {
  name: string;
  form: string;
  yearEnd: string;
  address: {
    street: string;
    houseNr: string;
    zip: string;
    city: string;
  };
}

type JsonRecord = Record<string, unknown>;
type Path = readonly (string | number)[];

export function extractCbeEnterprise(input: unknown): CbeEnterpriseResult {
  const source = unwrapEnterprise(input);
  const address = firstRecord(
    pickValue(source, ["address"]),
    pickValue(source, ["registeredOffice"]),
    pickValue(source, ["registeredOfficeAddress"]),
    pickValue(source, ["seatAddress"]),
    pickValue(source, ["seat", "address"]),
    pickValue(source, ["addresses", 0]),
  );
  const streetNumber = pickString(address, [
    ["houseNumber"],
    ["number"],
    ["buildingNumber"],
    ["streetNumber"],
    ["street_number"],
  ]);
  const box = pickString(address, [
    ["box"],
    ["boxNumber"],
    ["box_number"],
  ]);

  return {
    name: pickString(source, [
      ["name"],
      ["denomination"],
      ["enterpriseName"],
      ["names", 0],
      ["names", 0, "value"],
      ["names", 0, "name"],
      ["names", 0, "description"],
    ]),
    form: pickString(source, [
      ["legalForm"],
      ["legalForm", "description"],
      ["legalForm", "label"],
      ["legalFormDescription"],
      ["juridicalForm"],
      ["juridicalForm", "description"],
      ["juridical_form_short"],
      ["juridical_form"],
      ["companyForm"],
    ]),
    yearEnd: pickString(source, [
      ["fiscalYearEnd"],
      ["financialYearEnd"],
      ["endDateFiscalYear"],
      ["endDateFinancialYear"],
      ["yearEnd"],
    ]),
    address: {
      street: pickString(address, [
        ["street"],
        ["streetName"],
        ["streetDescription"],
        ["thoroughfare"],
      ]),
      houseNr: [streetNumber, box ? `bus ${box}` : ""].filter(Boolean).join(" "),
      zip: pickString(address, [
        ["postalCode"],
        ["zip"],
        ["postcode"],
        ["post_code"],
      ]),
      city: pickString(address, [
        ["municipality"],
        ["city"],
        ["cityName"],
        ["locality"],
      ]),
    },
  };
}

export function cbeEnterpriseToKboHtml(result: CbeEnterpriseResult): string {
  const streetLine = [result.address.street, result.address.houseNr].filter(Boolean).join(" ");
  const cityLine = [result.address.zip, result.address.city].filter(Boolean).join(" ");

  return `
    <table>
      <tr><td>Naam:</td><td>${escapeHtml(result.name)}</td></tr>
      <tr><td>Rechtsvorm:</td><td>${escapeHtml(result.form)}</td></tr>
      <tr><td>Einddatum boekjaar</td><td>${escapeHtml(result.yearEnd)}</td></tr>
      <tr><td>Adres van de zetel:</td><td>${escapeHtml(streetLine)}<br>${escapeHtml(cityLine)}</td></tr>
    </table>
  `;
}

function unwrapEnterprise(input: unknown): JsonRecord {
  let source = firstRecord(input);
  const wrapped = firstRecord(
    pickValue(source, ["enterprise"]),
    pickValue(source, ["data"]),
    pickValue(source, ["result"]),
    pickValue(source, ["results", 0]),
  );
  if (Object.keys(wrapped).length > 0) source = wrapped;
  return source;
}

function firstRecord(...values: unknown[]): JsonRecord {
  for (const value of values) {
    if (Array.isArray(value)) {
      const nested = firstRecord(...value);
      if (Object.keys(nested).length > 0) return nested;
    } else if (value && typeof value === "object") {
      return value as JsonRecord;
    }
  }
  return {};
}

function pickString(source: JsonRecord, paths: Path[]): string {
  for (const path of paths) {
    const value = stringifyValue(pickValue(source, path));
    if (value) return value;
  }
  return "";
}

function pickValue(source: JsonRecord, path: Path): unknown {
  let value: unknown = source;
  for (const segment of path) {
    if (typeof segment === "number") {
      value = Array.isArray(value) ? value[segment] : undefined;
    } else if (value && typeof value === "object") {
      value = (value as JsonRecord)[segment];
    } else {
      return undefined;
    }
  }
  return value;
}

function stringifyValue(value: unknown): string {
  if (typeof value === "string" || typeof value === "number") return cleanValue(value);
  if (Array.isArray(value)) {
    for (const item of value) {
      const text = stringifyValue(item);
      if (text) return text;
    }
  }
  if (value && typeof value === "object") {
    const record = value as JsonRecord;
    return pickString(record, [
      ["description"],
      ["label"],
      ["name"],
      ["value"],
      ["text"],
      ["nl"],
      ["fr"],
    ]);
  }
  return "";
}

function cleanValue(value: unknown): string {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
