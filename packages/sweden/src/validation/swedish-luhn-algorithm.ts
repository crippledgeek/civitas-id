import { LuhnAlgorithm } from "@civitas-id/core";
import type { ChecksumAlgorithm } from "@civitas-id/core";
import { InvalidIdNumberError } from "../error/invalid-id-number-error.js";

const LUHN = LuhnAlgorithm.getInstance();

/**
 * Swedish-specific wrapper around the Luhn algorithm.
 * Swedish IDs in 13-character format (YYYYMMDD-XXXX) only validate the 10-digit
 * portion (YYMMDDXXXX). This object delegates to the generic Luhn algorithm.
 */
export const SwedishLuhnAlgorithm: ChecksumAlgorithm & { toString(): string } = {
  calculateCheckDigit(input: string): number {
    if (!input || input.length === 0) {
      throw new InvalidIdNumberError("Input cannot be null or empty");
    }
    try {
      return LUHN.calculateCheckDigit(input, 9);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Invalid input";
      throw new InvalidIdNumberError(msg, { cause: e });
    }
  },

  isChecksumValid(input: string): boolean {
    if (!input || input.length < 2) return false;
    return LUHN.isChecksumValid(input, 10);
  },

  getAlgorithmName(): string {
    return "LUHN";
  },

  toString(): string {
    return "SwedishLuhnAlgorithm";
  },
};
