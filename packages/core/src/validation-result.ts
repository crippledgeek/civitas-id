export class ValidationResult {
  private constructor(
    private readonly _valid: boolean,
    private readonly _errorMessage?: string,
    private readonly _errorCode?: string,
  ) {}

  static valid(): ValidationResult {
    return new ValidationResult(true);
  }

  static invalid(errorMessage: string, errorCode?: string): ValidationResult {
    return new ValidationResult(false, errorMessage, errorCode);
  }

  isValid(): boolean {
    return this._valid;
  }

  isInvalid(): boolean {
    return !this._valid;
  }

  getErrorMessage(): string | undefined {
    return this._errorMessage;
  }

  getErrorCode(): string | undefined {
    return this._errorCode;
  }

  toString(): string {
    if (this._valid) return "ValidationResult{valid=true}";
    let s = `ValidationResult{valid=false, errorMessage='${this._errorMessage}'`;
    if (this._errorCode !== undefined) s += `, errorCode='${this._errorCode}'`;
    return `${s}}`;
  }
}
