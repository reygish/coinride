import { describe, expect, it } from "vitest";
import { parseAmount } from "./parseAmount";

describe("parseAmount", () => {
  it("parses shorthand and currency variants", () => {
    expect(parseAmount("beli nasi goreng 15rb")).toBe(15000);
    expect(parseAmount("bayar listrik 200k")).toBe(200000);
    expect(parseAmount("nasi goreng 15 ribu")).toBe(15000);
    expect(parseAmount("belanja Rp 50.000")).toBe(50000);
    expect(parseAmount("coffee 25rb")).toBe(25000);
    expect(parseAmount("salary 3jt")).toBe(3000000);
    expect(parseAmount("gaji 3 juta")).toBe(3000000);
    expect(parseAmount("rent 1.5m")).toBe(1500000);
    expect(parseAmount("listrik 200,000")).toBe(200000);
  });

  it("returns null when no amount is present", () => {
    expect(parseAmount("no numbers here")).toBeNull();
  });
});
