/**
 * Parse nominal uang dari string teks bebas.
 * Menangani format IDR dan shorthand Indonesia (rb, ribu, jt, juta, k, m).
 *
 * Contoh:
 *  "beli nasi goreng 15rb"    -> 15000
 *  "bayar listrik 200k"       -> 200000
 *  "nasi goreng 15 ribu"      -> 15000
 *  "belanja Rp 50.000"        -> 50000
 *  "coffee 25rb"              -> 25000
 *  "salary 3jt"               -> 3000000
 *  "gaji 3 juta"              -> 3000000
 *  "rent 1.5m"                -> 1500000
 *  "listrik 200,000"          -> 200000
 */
export function parseAmount(text: string): number | null {
  const normalized = text.toLowerCase().trim();

  const rpMatch = normalized.match(/rp\.?\s*(\d[\d.,]*)/);
  if (rpMatch) {
    return cleanNumber(rpMatch[1]);
  }

  const jutaMatch = normalized.match(/(\d+(?:[.,]\d+)?)\s*(?:jt|juta)/);
  if (jutaMatch) {
    return Math.round(parseFloat(jutaMatch[1].replace(",", ".")) * 1_000_000);
  }

  const ribuMatch = normalized.match(/(\d+(?:[.,]\d+)?)\s*(?:rb|ribu)/);
  if (ribuMatch) {
    return Math.round(parseFloat(ribuMatch[1].replace(",", ".")) * 1_000);
  }

  const kMatch = normalized.match(/(\d+(?:[.,]\d+)?)\s*k\b/);
  if (kMatch) {
    return Math.round(parseFloat(kMatch[1].replace(",", ".")) * 1_000);
  }

  const mMatch = normalized.match(/(\d+(?:[.,]\d+)?)\s*m\b/);
  if (mMatch) {
    return Math.round(parseFloat(mMatch[1].replace(",", ".")) * 1_000_000);
  }

  const separatorMatch = normalized.match(/(\d{1,3}(?:[.,]\d{3})+)/);
  if (separatorMatch) {
    return cleanNumber(separatorMatch[1]);
  }

  const plainMatch = normalized.match(/\b(\d{4,})\b/);
  if (plainMatch) {
    return parseInt(plainMatch[1], 10);
  }

  const smallMatch = normalized.match(/\b(\d{1,3})\b/);
  if (smallMatch) {
    const val = parseInt(smallMatch[1], 10);
    if (val > 0 && val <= 999) {
      return val * 1_000;
    }
  }

  return null;
}

function cleanNumber(numStr: string): number {
  const cleaned = numStr.replace(/[.,]/g, "");
  return parseInt(cleaned, 10);
}
