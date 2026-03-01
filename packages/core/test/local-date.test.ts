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

  describe("now()", () => {
    it("returns today in UTC without clock", () => {
      const d = LocalDate.now();
      const now = new Date();
      expect(d.year).toBe(now.getUTCFullYear());
      expect(d.month).toBe(now.getUTCMonth() + 1);
      expect(d.day).toBe(now.getUTCDate());
    });

    it("uses provided clock", () => {
      const fixed = LocalDate.of(2000, 6, 15);
      expect(LocalDate.now(() => fixed).equals(fixed)).toBe(true);
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

  describe("age()", () => {
    it("calculates full years", () => {
      expect(LocalDate.of(1990, 1, 1).age(LocalDate.of(2026, 1, 1))).toBe(36);
    });

    it("does not count birthday if not yet reached", () => {
      expect(LocalDate.of(1990, 12, 31).age(LocalDate.of(2025, 12, 30))).toBe(34);
    });

    it("counts birthday on exact birthday", () => {
      expect(LocalDate.of(1990, 6, 15).age(LocalDate.of(2025, 6, 15))).toBe(35);
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
