import { describe, expect, it } from "vitest";
import { LuhnAlgorithm } from "../src/luhn-algorithm.js";

describe("LuhnAlgorithm", () => {
  const algorithm = LuhnAlgorithm.getInstance();

  it("getInstance returns singleton instance", () => {
    expect(LuhnAlgorithm.getInstance()).toBe(LuhnAlgorithm.getInstance());
  });

  it("getAlgorithmName returns LUHN", () => {
    expect(algorithm.getAlgorithmName()).toBe("LUHN");
  });

  it("toString returns LuhnAlgorithm", () => {
    expect(algorithm.toString()).toBe("LuhnAlgorithm");
  });

  describe("calculateCheckDigit — basic", () => {
    it.each([
      ["12345678", 6],
      ["1234567", 4],
      ["123456", 9],
      ["0", 0],
      ["1", 8],
      ["123", 0],
      ["79927398713", 8],
      ["411111111111111", 1],
    ])("calculateCheckDigit(%s) === %i", (input, expected) => {
      expect(algorithm.calculateCheckDigit(input)).toBe(expected);
    });

    it("throws for empty input", () => {
      expect(() => algorithm.calculateCheckDigit("")).toThrow();
    });

    it.each(["12a34", "abc", "123.456", "123-456", "12 34"])(
      "throws for non-digit input %s",
      (input) => {
        expect(() => algorithm.calculateCheckDigit(input)).toThrow();
      },
    );
  });

  describe("calculateCheckDigit — with maxDigits", () => {
    it.each([
      ["123456789012", 10, 7],
      ["987654321", 5, 5],
      ["123456", 3, 4],
      ["123456789", 100, 7],
    ])("calculateCheckDigit(%s, %i) === %i", (input, maxDigits, expected) => {
      expect(algorithm.calculateCheckDigit(input, maxDigits)).toBe(expected);
    });
  });

  describe("isChecksumValid — correct checksums", () => {
    it.each([
      ["123456786", true],
      ["12345674", true],
      ["1234569", true],
      ["18", true],
      ["00", true],
      ["799273987138", true],
      ["4111111111111111", true],
    ])("isChecksumValid(%s) === %s", (input, expected) => {
      expect(algorithm.isChecksumValid(input)).toBe(expected);
    });
  });

  describe("isChecksumValid — incorrect checksums", () => {
    it.each(["123456785", "12345675", "1234561", "79927398710", "4111111111111112"])(
      "isChecksumValid(%s) === false",
      (input) => {
        expect(algorithm.isChecksumValid(input)).toBe(false);
      },
    );
  });

  it.each(["", "1"])("isChecksumValid('%s') returns false for too short input", (input) => {
    expect(algorithm.isChecksumValid(input)).toBe(false);
  });

  it.each(["12a34", "abc89", "123.45", "123-45", "12 34"])(
    "isChecksumValid('%s') returns false for non-digit chars",
    (input) => {
      expect(algorithm.isChecksumValid(input)).toBe(false);
    },
  );

  it("isChecksumValid with maxDigits ignores prefix", () => {
    expect(algorithm.isChecksumValid("0000123456786", 11)).toBe(true);
  });

  describe("Swedish personal number examples", () => {
    it.each([
      ["9001010017", true],
      ["9001010018", false],
    ])("isChecksumValid(%s) === %s", (input, expected) => {
      expect(algorithm.isChecksumValid(input)).toBe(expected);
    });
  });

  it("all zeros check digit is 0", () => {
    expect(algorithm.calculateCheckDigit("0000000000")).toBe(0);
  });

  it("all nines check digit is 0", () => {
    expect(algorithm.calculateCheckDigit("9999999999")).toBe(0);
  });

  it("validates all-zeros string", () => {
    expect(algorithm.isChecksumValid("00000000000")).toBe(true);
  });

  it("validates all-nines plus check", () => {
    expect(algorithm.isChecksumValid("99999999990")).toBe(true);
  });

  describe("round-trip", () => {
    it.each([
      "123456789",
      "987654321",
      "1111111111",
      "0000000000",
      "9999999999",
      "1234567890",
      "5555555555",
    ])("calculated check digit validates for %s", (input) => {
      const check = algorithm.calculateCheckDigit(input);
      expect(algorithm.isChecksumValid(input + check)).toBe(true);
    });
  });

  it("handles very long input without throwing", () => {
    expect(() => algorithm.calculateCheckDigit("1".repeat(1000))).not.toThrow();
  });

  it("validates very long input", () => {
    const long = "1".repeat(1000);
    expect(algorithm.isChecksumValid(long + algorithm.calculateCheckDigit(long))).toBe(true);
  });

  describe("credit card numbers", () => {
    it.each([
      ["4532015112830366", true],
      ["5425233430109903", true],
      ["378282246310003", true],
      ["4532015112830367", false],
      ["5425233430109904", false],
      ["378282246310004", false],
    ])("isChecksumValid(%s) === %s", (input, expected) => {
      expect(algorithm.isChecksumValid(input)).toBe(expected);
    });
  });

  it("single digit inputs", () => {
    const expected = [0, 8, 6, 4, 2, 9, 7, 5, 3, 1];
    for (let i = 0; i <= 9; i++) {
      expect(algorithm.calculateCheckDigit(String(i))).toBe(expected[i]);
    }
  });

  it("doubles even positions — 2000 gives 6", () => {
    expect(algorithm.calculateCheckDigit("2000")).toBe(6);
  });

  it("subtracts 9 when doubled > 9 — 5000 gives 9", () => {
    expect(algorithm.calculateCheckDigit("5000")).toBe(9);
  });

  it("subtracts 9 when doubled > 9 — 9000 gives 1", () => {
    expect(algorithm.calculateCheckDigit("9000")).toBe(1);
  });

  it("minimum valid length", () => {
    expect(algorithm.isChecksumValid("18")).toBe(true);
    expect(algorithm.isChecksumValid("17")).toBe(false);
  });

  it("maxDigits larger than input uses entire input", () => {
    const input = "12345";
    expect(algorithm.calculateCheckDigit(input, 1000)).toBe(algorithm.calculateCheckDigit(input));
  });

  it("consistent across multiple calls", () => {
    const r = algorithm.calculateCheckDigit("123456789");
    expect(algorithm.calculateCheckDigit("123456789")).toBe(r);
  });

  it("consistent with isChecksumValid for all single digits", () => {
    for (let i = 0; i <= 9; i++) {
      const digit = String(i);
      const check = algorithm.calculateCheckDigit(digit);
      expect(algorithm.isChecksumValid(digit + check)).toBe(true);
    }
  });
});
