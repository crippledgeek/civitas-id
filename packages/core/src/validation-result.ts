export type ValidationResult =
  | { readonly valid: true }
  | { readonly valid: false; readonly errorMessage: string; readonly errorCode?: string };

export const ValidationResult = {
  valid(): ValidationResult {
    return { valid: true };
  },

  invalid(errorMessage: string, errorCode?: string): ValidationResult {
    return errorCode !== undefined
      ? { valid: false, errorMessage, errorCode }
      : { valid: false, errorMessage };
  },

  toString(result: ValidationResult): string {
    if (result.valid) return "ValidationResult{valid=true}";
    let s = `ValidationResult{valid=false, errorMessage='${result.errorMessage}'`;
    if (result.errorCode !== undefined) s += `, errorCode='${result.errorCode}'`;
    return `${s}}`;
  },
} as const;
