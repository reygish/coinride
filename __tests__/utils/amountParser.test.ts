/**
 * __tests__/utils/amountParser.test.ts
 * Unit tests untuk fungsi parseAmount.
 *
 * Menerapkan prinsip Testable: setiap fungsi pure dapat di-test secara isolasi.
 * Jalankan dengan: npm test
 */

import { parseAmount, formatRupiah, formatShortAmount } from "@/lib/utils/amountParser";

describe("parseAmount", () => {
  // ─── Format Indonesia ──────────────────────────────────────────────────────
  describe("Indonesian shorthand", () => {
    it("should parse 'rb' shorthand", () => {
      expect(parseAmount("beli nasi goreng 15rb")).toBe(15000);
      expect(parseAmount("kopi 8rb")).toBe(8000);
    });

    it("should parse 'ribu' shorthand", () => {
      expect(parseAmount("nasi goreng 15 ribu")).toBe(15000);
      expect(parseAmount("bayar parkir 5 ribu")).toBe(5000);
    });

    it("should parse 'k' shorthand", () => {
      expect(parseAmount("mcdonalds 80k")).toBe(80000);
      expect(parseAmount("coffee 25k")).toBe(25000);
    });

    it("should parse 'jt' (juta) shorthand", () => {
      expect(parseAmount("gaji 3jt")).toBe(3000000);
      expect(parseAmount("biaya kuliah 1.5jt")).toBe(1500000);
    });

    it("should parse 'juta' shorthand", () => {
      expect(parseAmount("bayar kos 1 juta")).toBe(1000000);
      expect(parseAmount("freelance 2 juta")).toBe(2000000);
    });
  });

  // ─── Format Rupiah ────────────────────────────────────────────────────────
  describe("Rupiah format", () => {
    it("should parse 'Rp' prefix", () => {
      expect(parseAmount("bayar listrik Rp 75.000")).toBe(75000);
      expect(parseAmount("belanja Rp 50.000")).toBe(50000);
    });

    it("should parse 'rp' lowercase", () => {
      expect(parseAmount("transfer rp 200000")).toBe(200000);
    });
  });

  // ─── Format angka biasa ───────────────────────────────────────────────────
  describe("Plain numbers", () => {
    it("should parse numbers with dot separator", () => {
      expect(parseAmount("bayar listrik 200.000")).toBe(200000);
    });

    it("should parse numbers with comma separator", () => {
      expect(parseAmount("bayar listrik 200,000")).toBe(200000);
    });

    it("should parse plain large numbers", () => {
      expect(parseAmount("gaji 3500000")).toBe(3500000);
    });
  });

  // ─── Edge cases ───────────────────────────────────────────────────────────
  describe("Edge cases", () => {
    it("should return null for text without any numbers", () => {
      // "fried chicken" tanpa angka → parser return null
      // User harus input amount manual di form (field Amount terpisah dari description)
      expect(parseAmount("fried chicken")).toBeNull();
    });

    it("should handle mixed case", () => {
      expect(parseAmount("Bayar Listrik 200K")).toBe(200000);
      expect(parseAmount("GAJI 3JT")).toBe(3000000);
    });

    it("should handle extra whitespace", () => {
      expect(parseAmount("  nasi goreng  15 rb  ")).toBe(15000);
    });
  });

  // ─── Contoh dari spec ─────────────────────────────────────────────────────
  describe("Examples from spec", () => {
    it("contoh 1: nasi goreng 15rb", () => {
      expect(parseAmount("nasi goreng 15rb")).toBe(15000);
      expect(parseAmount("nasi goreng 15 ribu")).toBe(15000);
    });

    it("contoh 2: bayar listrik", () => {
      expect(parseAmount("bayar listrik 200k")).toBe(200000);
      expect(parseAmount("bayar listrik 200.000")).toBe(200000);
      expect(parseAmount("bayar listrik 200 ribu")).toBe(200000);
    });

    it("contoh 3: mcdonalds 80k", () => {
      expect(parseAmount("mcdonalds 80k")).toBe(80000);
    });

    it("contoh dari python: 15rb", () => {
      expect(parseAmount("beli nasi goreng 15rb")).toBe(15000);
      expect(parseAmount("bayar listrik Rp 75.000")).toBe(75000);
    });
  });
});

// ─── formatRupiah tests ────────────────────────────────────────────────────────
describe("formatRupiah", () => {
  it("should format numbers as IDR currency", () => {
    expect(formatRupiah(15000)).toContain("15.000");
    expect(formatRupiah(15000)).toContain("Rp");
  });

  it("should format million amounts", () => {
    expect(formatRupiah(1000000)).toContain("1.000.000");
  });
});

// ─── formatShortAmount tests ───────────────────────────────────────────────────
describe("formatShortAmount", () => {
  it("should shorten millions", () => {
    expect(formatShortAmount(1500000)).toBe("1.5jt");
    expect(formatShortAmount(3000000)).toBe("3jt");
  });

  it("should shorten thousands", () => {
    expect(formatShortAmount(15000)).toBe("15rb");
    expect(formatShortAmount(250000)).toBe("250rb");
  });

  it("should show plain number for small amounts", () => {
    expect(formatShortAmount(500)).toBe("500");
  });
});
