import { fc, test } from "@fast-check/vitest";
import { describe, expect } from "vitest";
import { SwedishLuhnAlgorithm } from "../../src/validation/swedish-luhn-algorithm.js";

describe("SwedishLuhnAlgorithm — property-based invariants", () => {
  test.prop([fc.stringMatching(/^\d{9}$/)])(
    "calculateCheckDigit followed by isChecksumValid always holds for any 9-digit base",
    (nineDigits) => {
      const check = SwedishLuhnAlgorithm.calculateCheckDigit(nineDigits);
      expect(SwedishLuhnAlgorithm.isChecksumValid(nineDigits + check)).toBe(true);
    },
  );

  test.prop([
    fc.stringMatching(/^\d{9}$/),
    fc.integer({ min: 0, max: 9 }),
    fc.integer({ min: 1, max: 9 }), // delta in 1..9 guarantees the digit changes
  ])(
    "any single-digit substitution within the 10-digit Luhn body breaks validation",
    (base, position, delta) => {
      const check = SwedishLuhnAlgorithm.calculateCheckDigit(base);
      const valid = base + check;
      const original = Number(valid[position]);
      const flipped = (original + delta) % 10;
      const corrupted = valid.slice(0, position) + flipped + valid.slice(position + 1);
      expect(SwedishLuhnAlgorithm.isChecksumValid(corrupted)).toBe(false);
    },
  );

  test.prop([fc.stringMatching(/^\d{9}$/)])(
    "calculateCheckDigit is deterministic — same input always produces same digit",
    (nineDigits) => {
      const a = SwedishLuhnAlgorithm.calculateCheckDigit(nineDigits);
      const b = SwedishLuhnAlgorithm.calculateCheckDigit(nineDigits);
      expect(a).toBe(b);
    },
  );

  test.prop([fc.stringMatching(/^\d{10}$/)])(
    "isChecksumValid on arbitrary 10-digit input returns a boolean (no throw on well-formed digit input)",
    (tenDigits) => {
      // Property: well-formed numeric input never throws.
      // (Invalid checksums return false, valid return true.)
      expect(typeof SwedishLuhnAlgorithm.isChecksumValid(tenDigits)).toBe("boolean");
    },
  );
});
