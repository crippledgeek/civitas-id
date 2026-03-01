/**
 * Contract for a checksum algorithm that can compute and validate check digits.
 *
 * Implementations include {@link LuhnAlgorithm}.
 */
export interface ChecksumAlgorithm {
  /**
   * Computes the check digit for the given numeric string.
   *
   * @param input - a string of decimal digits (the payload, excluding the check digit)
   * @param maxDigits - maximum number of trailing digits to include in the calculation
   * @returns the single check digit (0–9)
   * @throws {Error} if `input` is empty or contains non-digit characters
   */
  calculateCheckDigit(input: string, maxDigits?: number): number;

  /**
   * Returns `true` if the last digit of `input` matches the computed check digit.
   *
   * @param input - a string of decimal digits including the check digit as the last character
   * @param maxDigits - maximum number of trailing digits to include in the validation window
   * @returns `true` if the checksum is valid, `false` otherwise
   */
  isChecksumValid(input: string, maxDigits?: number): boolean;

  /**
   * Returns the canonical name of this algorithm, e.g. `"LUHN"`.
   *
   * @returns the algorithm name
   */
  getAlgorithmName(): string;
}
