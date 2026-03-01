/**
 * Represents the outcome of validating an ID number string.
 *
 * Use the static factory methods {@link ValidationResult.valid} and
 * {@link ValidationResult.invalid} to construct instances.
 */
export class ValidationResult {
  private constructor(
    private readonly _valid: boolean,
    private readonly _errorMessage?: string,
    private readonly _errorCode?: string,
  ) {}

  /**
   * Creates a successful validation result.
   *
   * @returns a `ValidationResult` with `isValid() === true`
   *
   * @example
   * const result = ValidationResult.valid();
   * result.isValid(); // true
   */
  static valid(): ValidationResult {
    return new ValidationResult(true);
  }

  /**
   * Creates a failed validation result with a human-readable message and optional error code.
   *
   * @param errorMessage - a description of why validation failed
   * @param errorCode - an optional machine-readable error code
   * @returns a `ValidationResult` with `isValid() === false`
   *
   * @example
   * const result = ValidationResult.invalid("Invalid checksum", "CHECKSUM_MISMATCH");
   * result.isValid();        // false
   * result.getErrorCode();   // "CHECKSUM_MISMATCH"
   */
  static invalid(errorMessage: string, errorCode?: string): ValidationResult {
    return new ValidationResult(false, errorMessage, errorCode);
  }

  /**
   * Returns `true` if the validation succeeded.
   *
   * @returns `true` for a valid result
   */
  isValid(): boolean {
    return this._valid;
  }

  /**
   * Returns `true` if the validation failed.
   *
   * @returns `true` for an invalid result
   */
  isInvalid(): boolean {
    return !this._valid;
  }

  /**
   * Returns the human-readable error message, if this result is invalid.
   *
   * @returns the error message, or `undefined` if the result is valid
   */
  getErrorMessage(): string | undefined {
    return this._errorMessage;
  }

  /**
   * Returns the machine-readable error code, if one was provided.
   *
   * @returns the error code, or `undefined` if not set
   */
  getErrorCode(): string | undefined {
    return this._errorCode;
  }

  /**
   * Returns a debug-friendly string representation of this result.
   *
   * @returns a string such as `"ValidationResult{valid=true}"` or
   *   `"ValidationResult{valid=false, errorMessage='...', errorCode='...'}"`
   */
  toString(): string {
    if (this._valid) return "ValidationResult{valid=true}";
    let s = `ValidationResult{valid=false, errorMessage='${this._errorMessage}'`;
    if (this._errorCode !== undefined) s += `, errorCode='${this._errorCode}'`;
    return `${s}}`;
  }
}
