import type { ChecksumAlgorithm } from "./checksum-algorithm.js";

/**
 * Const object implementation of the Luhn algorithm.
 *
 * Implements {@link ChecksumAlgorithm} and supports an optional `maxDigits` window
 * so that only the last N digits of a longer string are considered during validation.
 *
 * @example
 * LuhnAlgorithm.isChecksumValid("799273987138"); // true
 * LuhnAlgorithm.calculateCheckDigit("79927398713"); // 8
 */
export const LuhnAlgorithm: ChecksumAlgorithm & {
  getInstance(): typeof LuhnAlgorithm;
  toString(): string;
} = {
  /**
   * Returns the shared singleton-compatible reference.
   *
   * @returns the `LuhnAlgorithm` const object
   */
  getInstance() {
    return LuhnAlgorithm;
  },

  calculateCheckDigit(input: string, maxDigits = Number.MAX_SAFE_INTEGER): number {
    if (!input || input.length === 0) throw new Error("Input cannot be empty");
    const startIndex = input.length > maxDigits ? input.length - maxDigits : 0;
    let sum = 0;
    for (let i = startIndex; i < input.length; i++) {
      const code = input.charCodeAt(i);
      if (code < 48 || code > 57) throw new Error(`Invalid digit: ${input[i]}`);
      let digit = code - 48;
      if ((i - startIndex) % 2 === 0) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
    }
    return (10 - (sum % 10)) % 10;
  },

  isChecksumValid(input: string, maxDigits = Number.MAX_SAFE_INTEGER): boolean {
    if (!input || input.length < 2) return false;
    try {
      const slice = input.length > maxDigits ? input.slice(input.length - maxDigits) : input;
      const actualCheck = slice.charCodeAt(slice.length - 1) - 48;
      const expected = LuhnAlgorithm.calculateCheckDigit(slice.slice(0, -1), maxDigits - 1);
      return actualCheck === expected;
    } catch {
      return false;
    }
  },

  getAlgorithmName(): string {
    return "LUHN";
  },

  toString(): string {
    return "LuhnAlgorithm";
  },
};
