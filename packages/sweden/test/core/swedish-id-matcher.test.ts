import { describe, expect, it } from "vitest";
import { createMatcher, SwedishIdMatcher } from "../../src/core/swedish-id-matcher.js";
import { InvalidIdNumberError } from "../../src/error/invalid-id-number-error.js";

describe("SwedishIdMatcher — parser state", () => {
  describe("input rejection at the entry point (createMatcher)", () => {
    it("rejects null input", () => {
      expect(() => createMatcher(null)).toThrow(InvalidIdNumberError);
    });

    it("rejects undefined input", () => {
      expect(() => createMatcher(undefined)).toThrow(InvalidIdNumberError);
    });

    it("rejects empty string", () => {
      expect(() => createMatcher("")).toThrow(InvalidIdNumberError);
    });

    it("rejects whitespace-only input", () => {
      expect(() => createMatcher("   ")).toThrow(InvalidIdNumberError);
    });

    it("rejects input longer than 100 characters", () => {
      expect(() => createMatcher("1".repeat(101))).toThrow(InvalidIdNumberError);
    });
  });

  describe("non-numeric or syntactically-invalid input", () => {
    it("constructs a matcher in noMatch state for non-digit input", () => {
      const m = createMatcher("abcdefghij");
      expect(m.noMatch()).toBe(true);
    });

    it("constructs a matcher in noMatch state for input of exactly 100 characters of digits", () => {
      // Length passes the guard but no valid Swedish ID matches 100 characters.
      // Pins the boundary where the length filter and regex agree.
      const m = createMatcher("1".repeat(100));
      expect(m.noMatch()).toBe(true);
    });
  });

  describe("12-digit format (with century)", () => {
    it("captures century, year, month, day-group, and unique fields", () => {
      const m = createMatcher("198501019876");
      expect(m.noMatch()).toBe(false);
      expect(m.hasCentury()).toBe(true);
      expect(m.getCentury()).toBe("19");
      expect(m.getYear()).toBe(85);
      expect(m.getMonth()).toBe(1);
      expect(m.getDayGroup()).toBe("01");
      expect(m.getUnique()).toBe("9876");
    });
  });

  describe("10-digit format", () => {
    it("captures no century when no separator is present", () => {
      const m = createMatcher("8501019876");
      expect(m.noMatch()).toBe(false);
      expect(m.hasCentury()).toBe(false);
      expect(m.hasDelimiter()).toBe(false);
    });

    it("captures the '-' delimiter when present", () => {
      const m = createMatcher("850101-9876");
      expect(m.noMatch()).toBe(false);
      expect(m.hasDelimiter()).toBe(true);
      expect(m.getDelimiter()).toBe("-");
    });

    it("captures the '+' delimiter when present (centenarian form)", () => {
      const m = createMatcher("850101+9876");
      expect(m.noMatch()).toBe(false);
      expect(m.hasDelimiter()).toBe(true);
      expect(m.getDelimiter()).toBe("+");
    });
  });

  describe("decoration tolerance", () => {
    it("accepts an SE country-code prefix on a 12-digit input", () => {
      const m = createMatcher("SE198501019876");
      expect(m.noMatch()).toBe(false);
      expect(m.hasCentury()).toBe(true);
      expect(m.getCentury()).toBe("19");
    });

    it("trims leading and trailing whitespace before matching", () => {
      const m = createMatcher("  198501019876  ");
      expect(m.noMatch()).toBe(false);
      expect(m.getYear()).toBe(85);
    });
  });

  describe("static factory parity", () => {
    it("SwedishIdMatcher.of returns a matcher equivalent to createMatcher for already-trimmed input", () => {
      const direct = SwedishIdMatcher.of("198501019876");
      const viaCreate = createMatcher("198501019876");
      expect(direct.noMatch()).toBe(viaCreate.noMatch());
      expect(direct.getYear()).toBe(viaCreate.getYear());
    });
  });
});
