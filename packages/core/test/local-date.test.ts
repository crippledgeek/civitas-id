import { describe, expect, it } from "vitest";
import { LocalDate } from "../src/local-date.js";

describe("LocalDate", () => {
  describe("of()", () => {
    it("creates a date with given components", () => {
      const d = LocalDate.of(2024, 3, 15);
      expect(d.year).toBe(2024);
      expect(d.month).toBe(3);
      expect(d.day).toBe(15);
    });
  });

  describe("parse()", () => {
    it("parses ISO date string YYYY-MM-DD", () => {
      const d = LocalDate.parse("1990-01-15");
      expect(d.year).toBe(1990);
      expect(d.month).toBe(1);
      expect(d.day).toBe(15);
    });

    it("throws for invalid format", () => {
      expect(() => LocalDate.parse("19900115")).toThrow();
      expect(() => LocalDate.parse("1990/01/15")).toThrow();
    });
  });

  describe("isValid()", () => {
    it("returns true for valid dates", () => {
      expect(LocalDate.of(2024, 2, 29).isValid()).toBe(true); // leap year
      expect(LocalDate.of(2023, 12, 31).isValid()).toBe(true);
    });

    it("returns false for invalid dates", () => {
      expect(LocalDate.of(2023, 2, 29).isValid()).toBe(false); // non-leap year
      expect(LocalDate.of(2024, 13, 1).isValid()).toBe(false);
      expect(LocalDate.of(2024, 4, 31).isValid()).toBe(false);
    });
  });

  describe("toString()", () => {
    it("formats as YYYY-MM-DD", () => {
      expect(LocalDate.of(1990, 1, 5).toString()).toBe("1990-01-05");
      expect(LocalDate.of(2024, 12, 31).toString()).toBe("2024-12-31");
    });
  });

  describe("equals()", () => {
    it("returns true for equal dates", () => {
      expect(LocalDate.of(2024, 6, 15).equals(LocalDate.of(2024, 6, 15))).toBe(true);
    });

    it("returns false for different dates", () => {
      expect(LocalDate.of(2024, 6, 15).equals(LocalDate.of(2024, 6, 16))).toBe(false);
    });
  });
});

describe("LocalDate — removed clock-shaped API", () => {
  it("N18: LocalDate.now is not exposed (clock access belongs in country packages)", () => {
    expect((LocalDate as unknown as { now?: unknown }).now).toBeUndefined();
  });

  it("N18: LocalDate.prototype.age is not exposed (jurisdiction-bound; use computeAge)", () => {
    const d = LocalDate.of(1990, 1, 1) as unknown as { age?: unknown };
    expect(d.age).toBeUndefined();
  });
});
