export interface ConsumptionEntry {
  month: string;  // "DEZ/25"
  kwh: number;
  days: number;
}

export interface ParsedBill {
  distributor: "light" | "enel" | "cemig" | "outros";
  installationNumber: string;
  address: string;
  consumptionHistory: ConsumptionEntry[];
  avgMonthlyKwh: number;
  kwhTariff: number;       // preço unitário com tributos
  monthlyBill: number;     // avgMonthlyKwh × kwhTariff
}

// ── Number helpers ─────────────────────────────────────────

// "2.445" (BR thousands) → 2445 | "1,17921" → 1.17921 | "2.883,17" → 2883.17
function parseBR(s: string): number {
  if (s.includes(",")) {
    return parseFloat(s.replace(/\./g, "").replace(",", "."));
  }
  const parts = s.split(".");
  // "1.17921" — dot as decimal (unit price format, many digits after)
  if (parts.length === 2 && parts[1].length > 3) return parseFloat(s);
  // "2.445" — dot as thousands separator (3 digits after)
  if (parts.length === 2 && parts[1].length === 3) return parseInt(s.replace(".", ""), 10);
  return parseFloat(s.replace(",", "."));
}

// ── Distributor detection ──────────────────────────────────

function detectDistributor(text: string): ParsedBill["distributor"] {
  const t = text.toLowerCase();
  if (t.includes("light servi")) return "light";
  if (t.includes("enel")) return "enel";
  if (t.includes("cemig")) return "cemig";
  return "outros";
}

// ── Consumption history ────────────────────────────────────

const MONTHS_PT = "JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ";
// Primary: "DEZ/25 ------ 2.445 31" (with dashes)
const HISTORY_RE_DASHES = new RegExp(
  `(${MONTHS_PT})\\/(\\d{2})\\s+[-–—]+\\s+([\\d.,]+)\\s+(\\d{1,2})(?:\\s|$)`,
  "gi"
);
// Fallback: "DEZ/25 2.445 31" (without dashes, some PDF layouts omit them)
const HISTORY_RE_PLAIN = new RegExp(
  `(${MONTHS_PT})\\/(\\d{2})\\s+([\\d.,]+)\\s+(\\d{1,2})(?:\\s|$)`,
  "gi"
);

function parseConsumptionHistory(text: string): ConsumptionEntry[] {
  const entries: ConsumptionEntry[] = [];
  const seen = new Set<string>();

  function tryRegex(re: RegExp) {
    re.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = re.exec(text)) !== null) {
      const key = `${match[1].toUpperCase()}/${match[2]}`;
      if (seen.has(key)) continue;
      const kwh = parseBR(match[3]);
      const days = parseInt(match[4], 10);
      if (kwh > 0 && days > 0 && days <= 45) {
        seen.add(key);
        entries.push({ month: key, kwh, days });
      }
    }
  }

  tryRegex(HISTORY_RE_DASHES);
  // If we found very few entries with dashes, also try without dashes
  if (entries.length < 3) tryRegex(HISTORY_RE_PLAIN);

  return entries;
}

// ── Unit price (kWh tariff with taxes) ────────────────────

// Light: "Energia Elétrica kWh kWh 2.445 1.17921 2.883,17"
// Enel:  "ENERGIA ATIVA FORNECIDA kWh ... 0,XXXXX"
function parseKwhTariff(text: string): number {
  // Light: Preço unit column is the 2nd number after "kWh kWh {qty}"
  let lightRe = /Energia\s+El[eé]trica\s+kWh\s+kWh\s+[\d.,]+\s+([\d.,]+)/i;
  let m = lightRe.exec(text);
  if (m) return parseBR(m[1]);

  // Light variant: may have different formatting across lines
  lightRe = /Energia\s+El[eé]trica[^\n]*kWh[^\n]*([\d.,]+)\s+([\d.,]+)/i;
  m = lightRe.exec(text);
  if (m) {
    const v1 = parseBR(m[1]);
    const v2 = parseBR(m[2]);
    // The unit price should be in the reasonable range (0.4-3.0)
    if (v1 >= 0.4 && v1 <= 3.0) return v1;
    if (v2 >= 0.4 && v2 <= 3.0) return v2;
  }

  // Enel: "Energia Ativa Fornecida kWh {qty} {unit_price}"
  let enelRe = /Energia\s+Ativa\s+Fornecida\s+kWh\s+[\d.,]+\s+([\d.,]+)/i;
  m = enelRe.exec(text);
  if (m) return parseBR(m[1]);

  // Enel variant: may have different formatting
  enelRe = /Energia\s+Ativa[^\n]*kWh[^\n]*([\d.,]+)\s+([\d.,]+)/i;
  m = enelRe.exec(text);
  if (m) {
    const v1 = parseBR(m[1]);
    const v2 = parseBR(m[2]);
    if (v1 >= 0.4 && v1 <= 3.0) return v1;
    if (v2 >= 0.4 && v2 <= 3.0) return v2;
  }

  // Generic: look for "kWh" followed by a reasonable unit price
  const genericRe = /kWh\s+([\d.,]+)/gi;
  const candidates: number[] = [];
  let gm: RegExpExecArray | null;
  while ((gm = genericRe.exec(text)) !== null) {
    const v = parseBR(gm[1]);
    if (v >= 0.4 && v <= 3.0) candidates.push(v);
  }
  // Return most common or highest (com tributos is usually the highest)
  if (candidates.length > 0) {
    const freq = new Map<number, number>();
    for (const c of candidates) freq.set(c, (freq.get(c) ?? 0) + 1);
    return [...freq.entries()].sort((a, b) => b[1] - a[1])[0][0];
  }

  return 0;
}

// ── Address ────────────────────────────────────────────────

function parseAddress(text: string): string {
  // Light/Enel bills: "AV JOAO RIBEIRO 513 GP PILARES / RIO DE JANEIRO, RJ"
  // Handles uppercase without period (AV, RUA) and titled (Av., Rua)
  const re = /((?:AV|RUA|R\.|AVENIDA|TRAVESSA|TRAV\.|ALAMEDA|ESTRADA|PRAÇA|PCA|ROD\.|RODOVIA|Av\.|Rua|Avenida|Travessa|Alameda|Estrada|Praça|Rodovia)\.?\s+[A-ZÀ-Ü0-9][A-ZÀ-Ü\s\d]+?)\s+([A-ZÀ-Ü][A-ZÀ-Ü\s]+?)\s*\/\s*([A-ZÀ-Ü][A-ZÀ-Ü\s]+?),\s*([A-Z]{2})\s+CEP\s+([\d]{5}-[\d]{3})/;
  const m = re.exec(text.toUpperCase());
  if (m) {
    const street = m[1].trim();
    const neighborhood = m[2].trim();
    const city = m[3].trim();
    const state = m[4].trim();
    const cep = m[5].trim();
    return `${street}, ${neighborhood}, ${city}/${state}, CEP ${cep}`;
  }
  return "";
}

// ── Installation number ────────────────────────────────────

function parseInstallationNumber(text: string): string {
  // Light format: "2.137.992.059-42"
  const lightUC = /(\d{1,4}\.\d{3}\.\d{3}\.\d{3}-\d{2})/.exec(text);
  if (lightUC) return lightUC[1];

  // Enel/generic: 10–14 digit UC number
  const genericUC = /N[uú]mero\s+da\s+UC[:\s]*([\d./-]+)/i.exec(text);
  if (genericUC) return genericUC[1].trim();

  return "";
}

// ── Main parser ────────────────────────────────────────────

export function parseBillText(text: string): ParsedBill | null {
  const distributor = detectDistributor(text);

  const consumptionHistory = parseConsumptionHistory(text);
  if (consumptionHistory.length === 0) return null;

  // Use all months found (bill typically shows 12-13 months)
  const avgMonthlyKwh = Math.round(
    consumptionHistory.reduce((sum, e) => sum + e.kwh, 0) / consumptionHistory.length
  );

  const kwhTariff = parseKwhTariff(text);
  const monthlyBill = Math.round(avgMonthlyKwh * kwhTariff);

  const installationNumber = parseInstallationNumber(text);
  const address = parseAddress(text);

  return {
    distributor,
    installationNumber,
    address,
    consumptionHistory,
    avgMonthlyKwh,
    kwhTariff,
    monthlyBill,
  };
}
