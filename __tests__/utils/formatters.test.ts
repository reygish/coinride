/**
 * __tests__/utils/formatters.test.ts
 * Unit tests untuk utility formatting functions.
 */

import { formatCurrency, formatCompactCurrency, clamp, getBudgetStatusColor } from "@/lib/utils/formatters";

describe("formatCurrency", () => {
  it("should format IDR currency", () => {
    const result = formatCurrency(15000);
    expect(result).toContain("15.000");
    expect(result).toContain("Rp");
  });

  it("should format zero", () => {
    const result = formatCurrency(0);
    expect(result).toContain("0");
  });

  it("should format large amounts", () => {
    const result = formatCurrency(3500000);
    expect(result).toContain("3.500.000");
  });
});

describe("formatCompactCurrency", () => {
  it("should compact millions", () => {
    expect(formatCompactCurrency(1500000)).toBe("Rp 1.5M");
    expect(formatCompactCurrency(3000000)).toBe("Rp 3.0M");
  });

  it("should compact thousands", () => {
    expect(formatCompactCurrency(250000)).toBe("Rp 250K");
    expect(formatCompactCurrency(1000)).toBe("Rp 1K");
  });

  it("should show plain for small amounts", () => {
    expect(formatCompactCurrency(500)).toBe("Rp 500");
  });
});

describe("clamp", () => {
  it("should clamp value between min and max", () => {
    expect(clamp(50, 0, 100)).toBe(50);
    expect(clamp(-10, 0, 100)).toBe(0);
    expect(clamp(150, 0, 100)).toBe(100);
  });

  it("should handle equal boundaries", () => {
    expect(clamp(100, 100, 100)).toBe(100);
  });
});

describe("getBudgetStatusColor", () => {
  it("should return green for safe budget", () => {
    expect(getBudgetStatusColor(50)).toBe("#10B981");
    expect(getBudgetStatusColor(74)).toBe("#10B981");
  });

  it("should return amber for warning budget", () => {
    expect(getBudgetStatusColor(80)).toBe("#F59E0B");
    expect(getBudgetStatusColor(99)).toBe("#F59E0B");
  });

  it("should return red for exceeded budget", () => {
    expect(getBudgetStatusColor(101)).toBe("#EF4444");
    expect(getBudgetStatusColor(200)).toBe("#EF4444");
  });
});
