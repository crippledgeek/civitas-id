import { describe, expect, it } from "vitest";
import { IllegalIdNumberException } from "../../src/error/illegal-id-number-exception.js";
import { SwedishLuhnAlgorithm } from "../../src/validation/swedish-luhn-algorithm.js";

describe("SwedishLuhnAlgorithm", () => {
  describe("getAlgorithmName", () => {
    it("returns LUHN", () => {
      expect(SwedishLuhnAlgorithm.getAlgorithmName()).toBe("LUHN");
    });
  });

  describe("calculateCheckDigit", () => {
    it("calculates check digit for a valid personal number base", () => {
      expect(SwedishLuhnAlgorithm.calculateCheckDigit("900101980")).toBe(2);
    });

    it("calculates check digit for another valid personal number base", () => {
      expect(SwedishLuhnAlgorithm.calculateCheckDigit("900102981")).toBe(9);
    });

    it("calculates check digit for a third valid personal number base", () => {
      expect(SwedishLuhnAlgorithm.calculateCheckDigit("900103980")).toBe(0);
    });

    it("calculates check digit for all zeros", () => {
      expect(SwedishLuhnAlgorithm.calculateCheckDigit("000000000")).toBe(0);
    });

    it("returns a digit in range 0-9 for various input lengths", () => {
      const d9 = SwedishLuhnAlgorithm.calculateCheckDigit("990101980");
      expect(d9).toBeGreaterThanOrEqual(0);
      expect(d9).toBeLessThanOrEqual(9);

      const d6 = SwedishLuhnAlgorithm.calculateCheckDigit("990101");
      expect(d6).toBeGreaterThanOrEqual(0);
      expect(d6).toBeLessThanOrEqual(9);
    });

    it("throws IllegalIdNumberException for empty input", () => {
      expect(() => SwedishLuhnAlgorithm.calculateCheckDigit("")).toThrow(IllegalIdNumberException);
    });

    it("throws IllegalIdNumberException for invalid character", () => {
      expect(() => SwedishLuhnAlgorithm.calculateCheckDigit("99010112A")).toThrow(
        IllegalIdNumberException,
      );
    });

    it("throws IllegalIdNumberException for space character", () => {
      expect(() => SwedishLuhnAlgorithm.calculateCheckDigit("990101 123")).toThrow(
        IllegalIdNumberException,
      );
    });

    it("throws IllegalIdNumberException for dash character", () => {
      expect(() => SwedishLuhnAlgorithm.calculateCheckDigit("990101-123")).toThrow(
        IllegalIdNumberException,
      );
    });

    it("works with single digit input", () => {
      const d = SwedishLuhnAlgorithm.calculateCheckDigit("1");
      expect(d).toBeGreaterThanOrEqual(0);
      expect(d).toBeLessThanOrEqual(9);
    });

    it("works with nine digit input", () => {
      const d = SwedishLuhnAlgorithm.calculateCheckDigit("890010198");
      expect(d).toBeGreaterThanOrEqual(0);
      expect(d).toBeLessThanOrEqual(9);
    });
  });

  describe("isChecksumValid", () => {
    it("validates valid personal numbers", () => {
      expect(SwedishLuhnAlgorithm.isChecksumValid("9001019802")).toBe(true);
      expect(SwedishLuhnAlgorithm.isChecksumValid("9001029819")).toBe(true);
      expect(SwedishLuhnAlgorithm.isChecksumValid("9001039800")).toBe(true);
      expect(SwedishLuhnAlgorithm.isChecksumValid("9001049817")).toBe(true);
    });

    it("rejects numbers with wrong check digit", () => {
      expect(SwedishLuhnAlgorithm.isChecksumValid("9001019803")).toBe(false);
      expect(SwedishLuhnAlgorithm.isChecksumValid("9001029810")).toBe(false);
    });

    it("validates all zeros", () => {
      expect(SwedishLuhnAlgorithm.isChecksumValid("0000000000")).toBe(true);
    });

    it("returns false for empty input", () => {
      expect(SwedishLuhnAlgorithm.isChecksumValid("")).toBe(false);
    });

    it("returns false for too short input", () => {
      expect(SwedishLuhnAlgorithm.isChecksumValid("1")).toBe(false);
    });

    it("returns false for invalid character", () => {
      expect(SwedishLuhnAlgorithm.isChecksumValid("189001019A02")).toBe(false);
    });
  });

  describe("round-trip", () => {
    it("calculateCheckDigit then isChecksumValid produces valid number", () => {
      const input = "890010198";
      const checkDigit = SwedishLuhnAlgorithm.calculateCheckDigit(input);
      const fullNumber = input + checkDigit;
      expect(SwedishLuhnAlgorithm.isChecksumValid(fullNumber)).toBe(true);
    });

    it("round-trip works for multiple inputs", () => {
      const inputs = ["890010198", "890010298", "890010398", "890010498"];
      for (const input of inputs) {
        const checkDigit = SwedishLuhnAlgorithm.calculateCheckDigit(input);
        const fullNumber = input + checkDigit;
        expect(SwedishLuhnAlgorithm.isChecksumValid(fullNumber)).toBe(true);
      }
    });
  });

  describe("toString", () => {
    it("returns SwedishLuhnAlgorithm", () => {
      expect(SwedishLuhnAlgorithm.toString()).toBe("SwedishLuhnAlgorithm");
    });
  });
});
