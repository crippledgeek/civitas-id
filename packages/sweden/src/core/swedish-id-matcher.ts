import { InvalidIdNumberError } from "../error/invalid-id-number-error.js";

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
    const groups = this.requireGroups();
    const century = groups.century;
    if (century === undefined || century === LEGAL_PERSON_CENTURY_PREFIX) {
      return "-";
    }
    const datePart = century + this.getDate();
    const birthYear = Number.parseInt(datePart.substring(0, 4), 10);
    const now = new Date().getUTCFullYear();
    const age = now - birthYear;
    return age < 100 ? "-" : "+";
  }

  getDelimiter(): string | undefined {
    return this.requireGroups().delimiter;
  }

  getDate(): string {
    const date = this.requireGroups().date;
    if (date === undefined) throw new Error("SwedishIdMatcher: missing date group in match result");
    return date;
  }

  getYear(): number {
    return Number.parseInt(this.getYearGroup(), 10);
  }

  getMonth(): number {
    return Number.parseInt(this.getMonthGroup(), 10);
  }

  getCentury(): string | undefined {
    return this.requireGroups().century;
  }

  getUnique(): string {
    const unique = this.requireGroups().unique;
    if (unique === undefined)
      throw new Error("SwedishIdMatcher: missing unique group in match result");
    return unique;
  }

  getYearGroup(): string {
    const year = this.requireGroups().year;
    if (year === undefined) throw new Error("SwedishIdMatcher: missing year group in match result");
    return year;
  }

  getMonthGroup(): string {
    const month = this.requireGroups().month;
    if (month === undefined)
      throw new Error("SwedishIdMatcher: missing month group in match result");
    return month;
  }

  getDayGroup(): string {
    const day = this.requireGroups().day;
    if (day === undefined) throw new Error("SwedishIdMatcher: missing day group in match result");
    return day;
  }

  withBirthYearAndDelimiter(birthYear: number, delimiter: string): string {
    return (
      String(birthYear) + this.getMonthGroup() + this.getDayGroup() + delimiter + this.getUnique()
    );
  }

  private requireGroups(): Record<string, string | undefined> {
    if (this.result === null) {
      throw new Error("SwedishIdMatcher: attempted to access groups on a no-match result");
    }
    return this.result.groups ?? {};
  }

  private resolveDelimiter(): string {
    const delimiter = this.getDelimiter();
    return delimiter !== undefined ? delimiter : this.inferDelimiter();
  }

  getShortFormat(): string {
    return this.getDate() + this.resolveDelimiter() + this.getUnique();
  }

  getLongFormat(): string {
    return (this.getCentury() ?? "") + this.getDate() + this.resolveDelimiter() + this.getUnique();
  }
}

/**
 * Creates a SwedishIdMatcher from an input string, throwing on null/empty/too-long inputs.
 */
export function createMatcher(input: string | null | undefined): SwedishIdMatcher {
  if (input === null || input === undefined) {
    throw new InvalidIdNumberError("Invalid Swedish ID number: input is null");
  }
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    throw new InvalidIdNumberError("Invalid Swedish ID number: input is empty");
  }
  if (trimmed.length > 100) {
    throw new InvalidIdNumberError("Invalid Swedish ID number: input too long");
  }
  return SwedishIdMatcher.of(trimmed);
}
