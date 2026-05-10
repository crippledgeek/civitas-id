import { describe, expect, it } from "vitest";
import { LocalDate } from "../src/local-date.js";
import { type AnniversaryResolver, computeAge } from "../src/anniversary.js";

// Stub resolver for core tests — uses literal birth-month/day every year.
const literalResolver: AnniversaryResolver = {
  resolve(birth, year) {
    return LocalDate.of(year, birth.month, birth.day);
  },
};

describe("computeAge", () => {
  it("returns 0 when today equals the birth date", () => {
    const birth = LocalDate.of(2026, 5, 8);
    const today = LocalDate.of(2026, 5, 8);
    expect(computeAge(birth, today, literalResolver)).toBe(0);
  });

  it("returns the year diff when today is on or after the anniversary", () => {
    const birth = LocalDate.of(1990, 6, 15);
    expect(computeAge(birth, LocalDate.of(2026, 6, 15), literalResolver)).toBe(36);
    expect(computeAge(birth, LocalDate.of(2026, 12, 31), literalResolver)).toBe(36);
  });

  it("subtracts one when today is before the anniversary in the current year", () => {
    const birth = LocalDate.of(1990, 6, 15);
    expect(computeAge(birth, LocalDate.of(2026, 6, 14), literalResolver)).toBe(35);
    expect(computeAge(birth, LocalDate.of(2026, 1, 1), literalResolver)).toBe(35);
  });

  it("never returns negative ages (clamps to 0)", () => {
    const birth = LocalDate.of(2030, 1, 1);
    const today = LocalDate.of(2025, 1, 1);
    expect(computeAge(birth, today, literalResolver)).toBe(0);
  });

  it("delegates leap-day handling to the resolver", () => {
    const swedishStyleResolver: AnniversaryResolver = {
      resolve(birth, year) {
        if (birth.month === 2 && birth.day === 29) {
          const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
          return LocalDate.of(year, 2, isLeap ? 29 : 28);
        }
        return LocalDate.of(year, birth.month, birth.day);
      },
    };
    const birth = LocalDate.of(2008, 2, 29);
    expect(computeAge(birth, LocalDate.of(2026, 2, 28), swedishStyleResolver)).toBe(18);
    expect(computeAge(birth, LocalDate.of(2026, 2, 27), swedishStyleResolver)).toBe(17);
  });
});
