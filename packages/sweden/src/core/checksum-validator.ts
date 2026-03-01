import { SwedishLuhnAlgorithm } from "../validation/swedish-luhn-algorithm.js";

/**
 * Utility for validating checksums on Swedish IDs using the Luhn algorithm.
 */
export const ChecksumValidator = {
  /**
   * Validates that the checksum in the ID is correct.
   * @param id ID number, digits only.
   */
  isChecksumValid(id: string): boolean {
    return SwedishLuhnAlgorithm.isChecksumValid(id);
  },

  /**
   * Calculates the check digit for an incomplete ID number.
   * @param id Incomplete ID number, digits only.
   */
  calculateCheckDigit(id: string): number {
    return SwedishLuhnAlgorithm.calculateCheckDigit(id);
  },
} as const;
