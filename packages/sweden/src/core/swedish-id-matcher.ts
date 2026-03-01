import { IllegalIdNumberException } from "../error/illegal-id-number-exception.js";

export const LEGAL_PERSON_CENTURY_PREFIX = "16";

/**
 * Regex parsing helper for Swedish ID number patterns.
 * Handles both 10-digit and 12-digit formats, with/without separators (+/-).
 */
export class SwedishIdMatcher {
  private static readonly SSN_PATTERN =
    /^(SE)?(?<century>\d{2})?(?<date>(?<year>\d{2})(?<month>\d{2})(?<day>\d{2}))(?<delimiter>[-+])?(?<unique>\d{4})$/;

  private readonly result: RegExpExecArray | null;

  private constructor(input: string) {
    this.result = SwedishIdMatcher.SSN_PATTERN.exec(input);
  }

  static of(input: string): SwedishIdMatcher {
    return new SwedishIdMatcher(input);
  }

  match(): boolean {
    return this.result !== null;
  }

  noMatch(): boolean {
    return !this.match();
  }

  hasCentury(): boolean {
    return this.result?.groups?.century !== undefined;
  }

  hasDelimiter(): boolean {
    return this.result?.groups?.delimiter !== undefined;
  }

  inferDelimiter(): string {
    const century = this.result?.groups?.century;
    if (century === undefined) {
      return "-";
    }
    if (century === LEGAL_PERSON_CENTURY_PREFIX) {
      return "-";
    }
    const datePart = century + this.getDate();
    const birthYear = Number.parseInt(datePart.substring(0, 4), 10);
    const now = new Date().getUTCFullYear();
    const age = now - birthYear;
    return age < 100 ? "-" : "+";
  }

  getDelimiter(): string | undefined {
    return this.result?.groups?.delimiter;
  }

  getDate(): string {
    return this.result?.groups?.date ?? "";
  }

  getYear(): number {
    return Number.parseInt(this.getYearGroup(), 10);
  }

  getMonth(): number {
    return Number.parseInt(this.getMonthGroup(), 10);
  }

  getCentury(): string | undefined {
    return this.result?.groups?.century;
  }

  getUnique(): string {
    return this.result?.groups?.unique ?? "";
  }

  getYearGroup(): string {
    return this.result?.groups?.year ?? "";
  }

  getMonthGroup(): string {
    return this.result?.groups?.month ?? "";
  }

  getDayGroup(): string {
    return this.result?.groups?.day ?? "";
  }

  withBirthYearAndDelimiter(birthYear: number, delimiter: string): string {
    return (
      String(birthYear) + this.getMonthGroup() + this.getDayGroup() + delimiter + this.getUnique()
    );
  }

  getShortFormat(): string {
    const delimiter = this.hasDelimiter() ? (this.getDelimiter() ?? "") : this.inferDelimiter();
    return this.getDate() + delimiter + this.getUnique();
  }

  getLongFormat(): string {
    const delimiter = this.hasDelimiter() ? (this.getDelimiter() ?? "") : this.inferDelimiter();
    return (this.getCentury() ?? "") + this.getDate() + delimiter + this.getUnique();
  }
}

/**
 * Creates a SwedishIdMatcher from an input string, throwing on null/empty/too-long inputs.
 */
export function createMatcher(input: string | null | undefined): SwedishIdMatcher {
  if (input === null || input === undefined) {
    throw new IllegalIdNumberException("Invalid Swedish ID number: input is null");
  }
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    throw new IllegalIdNumberException("Invalid Swedish ID number: input is empty");
  }
  if (trimmed.length > 100) {
    throw new IllegalIdNumberException("Invalid Swedish ID number: input too long");
  }
  return SwedishIdMatcher.of(trimmed);
}
