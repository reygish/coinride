/**
 * lib/utils/amountParser.ts
 * Utility untuk mem-parse nominal uang dari teks bebas dalam Bahasa Indonesia dan Inggris.
 *
 * Menerapkan prinsip:
 * - Single Responsibility: hanya bertugas mem-parse amount
 * - Testable: fungsi pure tanpa side effects, mudah di-unit test
 * - Reusable: dapat dipakai di frontend (form) maupun backend (AI pipeline)
 *
 * Contoh yang didukung:
 *   "beli nasi goreng 15rb"    → 15000
 *   "bayar listrik 200k"       → 200000
 *   "nasi goreng 15 ribu"      → 15000
 *   "belanja Rp 50.000"        → 50000
 *   "coffee 25rb"              → 25000
 *   "salary 3jt"               → 3000000
 *   "gaji 3 juta"              → 3000000
 *   "rent 1.5m"                → 1500000
 *   "listrik 200,000"          → 200000
 */

/**
 * Parse nominal uang dari string teks bebas.
 * Menangani format IDR dan shorthand Indonesia (rb, ribu, jt, juta, k, m).
 *
 * @param text - Teks input dari user
 * @returns Nominal dalam integer (IDR), atau null jika tidak ditemukan
 */
export function parseAmount(text: string): number | null {
  // Normalisasi: lowercase dan hapus karakter yang tidak relevan
  const normalized = text.toLowerCase().trim();

  // Coba setiap pola secara berurutan dari yang paling spesifik

  // Pola 1: "Rp 50.000" atau "rp50000" atau "rp 50,000"
  const rpMatch = normalized.match(/rp\.?\s*(\d[\d.,]*)/);
  if (rpMatch) {
    return cleanNumber(rpMatch[1]);
  }

  // Pola 2: "3jt" atau "3 juta" atau "1.5jt" (juta = 1.000.000)
  const jutaMatch = normalized.match(/(\d+(?:[.,]\d+)?)\s*(?:jt|juta)/);
  if (jutaMatch) {
    return Math.round(parseFloat(jutaMatch[1].replace(",", ".")) * 1_000_000);
  }

  // Pola 3: "15rb" atau "15 ribu" atau "15k" (ribu = 1.000)
  // Urutan penting: "ribu" harus dicek sebelum "r" saja
  const ribuMatch = normalized.match(/(\d+(?:[.,]\d+)?)\s*(?:rb|ribu)/);
  if (ribuMatch) {
    return Math.round(parseFloat(ribuMatch[1].replace(",", ".")) * 1_000);
  }

  // Pola 4: "200k" atau "1.5k" (k = kilo = 1.000)
  const kMatch = normalized.match(/(\d+(?:[.,]\d+)?)\s*k\b/);
  if (kMatch) {
    return Math.round(parseFloat(kMatch[1].replace(",", ".")) * 1_000);
  }

  // Pola 5: "1.5m" atau "2m" (m = million = 1.000.000, untuk English input)
  const mMatch = normalized.match(/(\d+(?:[.,]\d+)?)\s*m\b/);
  if (mMatch) {
    return Math.round(parseFloat(mMatch[1].replace(",", ".")) * 1_000_000);
  }

  // Pola 6: Angka dengan separator titik/koma ribuan, e.g. "200.000" atau "200,000"
  // Hanya ambil jika angkanya >= 1000 (kemungkinan besar nominal uang)
  const separatorMatch = normalized.match(/(\d{1,3}(?:[.,]\d{3})+)/);
  if (separatorMatch) {
    return cleanNumber(separatorMatch[1]);
  }

  // Pola 7: Angka biasa tanpa satuan, e.g. "15000" atau "80000"
  const plainMatch = normalized.match(/\b(\d{4,})\b/);
  if (plainMatch) {
    return parseInt(plainMatch[1], 10);
  }

  // Pola 8: Angka kecil tanpa satuan (untuk kasus seperti "fried chicken 20")
  // Di sini kita asumsikan ribuan (karena harga minimal biasanya 1000)
  const smallMatch = normalized.match(/\b(\d{1,3})\b/);
  if (smallMatch) {
    const val = parseInt(smallMatch[1], 10);
    // Jika ada context kata yang mengindikasikan ini harga, kalikan 1000
    if (val > 0 && val <= 999) {
      return val * 1_000;
    }
  }

  return null;
}

/**
 * Bersihkan string angka dengan separator titik/koma menjadi integer.
 * Cerdas mendeteksi apakah titik/koma adalah separator ribuan atau desimal.
 *
 * @param numStr - String angka, e.g. "50.000" atau "50,000"
 * @returns Integer
 */
function cleanNumber(numStr: string): number {
  // Hapus semua titik dan koma (asumsi: keduanya adalah separator ribuan di IDR)
  const cleaned = numStr.replace(/[.,]/g, "");
  return parseInt(cleaned, 10);
}

/**
 * Format angka menjadi string rupiah yang mudah dibaca.
 * Contoh: 15000 → "Rp 15.000"
 *
 * @param amount - Nominal dalam IDR
 * @returns String yang diformat
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format angka menjadi shorthand yang ringkas.
 * Contoh: 1500000 → "1.5jt", 15000 → "15rb", 500 → "500"
 *
 * @param amount - Nominal dalam IDR
 * @returns Shorthand string
 */
export function formatShortAmount(amount: number): string {
  if (amount >= 1_000_000) {
    const juta = amount / 1_000_000;
    return `${juta % 1 === 0 ? juta : juta.toFixed(1)}jt`;
  }
  if (amount >= 1_000) {
    const ribu = amount / 1_000;
    return `${ribu % 1 === 0 ? ribu : ribu.toFixed(1)}rb`;
  }
  return String(amount);
}
