import { describe, expect, it } from "vitest";
import { LocalDate } from "@deathbycode/civitas-id-core";
import { swedishAnniversaryResolver } from "../../src/internal/swedish-anniversary.js";

describe("swedishAnniversaryResolver (Lag 1930:173 §1)", () => {
  describe("non-leap-day birthdays — literal anniversary", () => {
    it("returns the literal birth-month/day in the target year", () => {
      const birth = LocalDate.of(1990, 6, 15);
      const anniv = swedishAnniversaryResolver.resolve(birth, 2026);
      expect(anniv.equals(LocalDate.of(2026, 6, 15))).toBe(true);
    });

    it("returns the literal birth-month/day in a leap year", () => {
      const birth = LocalDate.of(1990, 6, 15);
      const anniv = swedishAnniversaryResolver.resolve(birth, 2028);
      expect(anniv.equals(LocalDate.of(2028, 6, 15))).toBe(true);
    });
  });

  describe("Feb-29 birthdays — leap-year anniversaries", () => {
    it("returns Feb-29 in a leap year (2028 is leap)", () => {
      const birth = LocalDate.of(2008, 2, 29);
      const anniv = swedishAnniversaryResolver.resolve(birth, 2028);
      expect(anniv.equals(LocalDate.of(2028, 2, 29))).toBe(true);
    });

    it("returns Feb-29 in the 400-year leap year (2400 is leap)", () => {
      const birth = LocalDate.of(2008, 2, 29);
      const anniv = swedishAnniversaryResolver.resolve(birth, 2400);
      expect(anniv.equals(LocalDate.of(2400, 2, 29))).toBe(true);
    });
  });

  describe("Feb-29 birthdays — non-leap-year anniversaries (§1 clamp)", () => {
    it("returns Feb-28 in a non-leap year (2026 is non-leap)", () => {
      const birth = LocalDate.of(2008, 2, 29);
      const anniv = swedishAnniversaryResolver.resolve(birth, 2026);
      expect(anniv.equals(LocalDate.of(2026, 2, 28))).toBe(true);
    });

    it("returns Feb-28 in a century-non-leap year (2100 is non-leap by 100-year rule)", () => {
      const birth = LocalDate.of(2008, 2, 29);
      const anniv = swedishAnniversaryResolver.resolve(birth, 2100);
      expect(anniv.equals(LocalDate.of(2100, 2, 28))).toBe(true);
    });

    // Anti-Germany guard: Lag §1 says Feb-28, not Mar-1.
    it("MUST NOT return March-1 in a non-leap year (anti-Germany guard)", () => {
      const birth = LocalDate.of(2008, 2, 29);
      const anniv = swedishAnniversaryResolver.resolve(birth, 2026);
      expect(anniv.month).toBe(2);
      expect(anniv.day).toBe(28);
      expect(anniv.equals(LocalDate.of(2026, 3, 1))).toBe(false);
    });

    // Guard against legacy `new Date(y, 1, 29)` rollover (silent +1 day → Mar-1).
    it("does not silently roll Feb-29 to Mar-1 via legacy Date constructor", () => {
      const birth = LocalDate.of(2008, 2, 29);
      const anniv = swedishAnniversaryResolver.resolve(birth, 2025);
      expect(anniv.month).toBe(2);
    });
  });
});
