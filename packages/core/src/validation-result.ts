/**
 * Represents the outcome of validating an ID number string.
 *
 * This is a discriminated union: check the `valid` property to narrow the type.
 * Use the companion `ValidationResult` const object's factory methods
 * {@link ValidationResult.valid} and {@link ValidationResult.invalid} to construct instances.
 */
export type ValidationResult =
  | { readonly valid: true }
  | { readonly valid: false; readonly errorMessage: string; readonly errorCode?: string };

export const ValidationResult = {
  /**
   * Creates a successful validation result.
   *
   * @returns a `ValidationResult` with `valid === true`
   *
   * @example
   * const result = ValidationResult.valid();
   * result.valid; // true
   */
  valid(): ValidationResult {
    return { valid: true };
  },

  /**
   * Creates a failed validation result with a human-readable message and optional error code.
   *
   * @param errorMessage - a description of why validation failed
   * @param errorCode - an optional machine-readable error code
   * @returns a `ValidationResult` with `valid === false`
   *
   * @example
   * const result = ValidationResult.invalid("Invalid checksum", "CHECKSUM_MISMATCH");
   * result.valid;          // false
   * result.errorMessage;   // "Invalid checksum"
   * result.errorCode;      // "CHECKSUM_MISMATCH"
   */
  invalid(errorMessage: string, errorCode?: string): ValidationResult {
    return errorCode !== undefined
      ? { valid: false, errorMessage, errorCode }
      : { valid: false, errorMessage };
  },

  /**
   * Returns a debug-friendly string representation of the given result.
   *
   * @param result - the validation result to format
   * @returns a string such as `"ValidationResult{valid=true}"` or
   *   `"ValidationResult{valid=false, errorMessage='...', errorCode='...'}"`
   */
  toString(result: ValidationResult): string {
    if (result.valid) return "ValidationResult{valid=true}";
    let s = `ValidationResult{valid=false, errorMessage='${result.errorMessage}'`;
    if (result.errorCode !== undefined) s += `, errorCode='${result.errorCode}'`;
    return `${s}}`;
  },
} as const;
