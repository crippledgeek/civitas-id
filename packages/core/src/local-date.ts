/**
 * An immutable calendar date without time or time-zone information.
 *
 * Suitable for representing birth dates, registration dates, and reference dates
 * without introducing a date-library dependency.
 */
export class LocalDate {
  private constructor(
    /** The full calendar year (e.g. `1990`). */
    readonly year: number,
    /** The month of year, 1–12. */
    readonly month: number,
    /** The day of month, 1–31. */
    readonly day: number,
  ) {}

  /**
   * Creates a `LocalDate` from explicit year, month, and day components.
   *
   * @param year - the full calendar year
   * @param month - the month of year (1–12)
   * @param day - the day of month (1–31)
   * @returns a new `LocalDate` instance
   */
  static of(year: number, month: number, day: number): LocalDate {
    return new LocalDate(year, month, day);
  }

  /**
   * Returns today's date, optionally sourced from a clock function for testability.
   *
   * @param clock - optional function returning a fixed or controlled date
   * @returns the current date according to UTC or the provided clock
   *
   * @example
   * const today = LocalDate.now();
   * const fixed = LocalDate.now(() => LocalDate.of(2024, 6, 15));
   */
  static now(clock?: () => LocalDate): LocalDate {
    if (clock) return clock();
    const d = new Date();
    return new LocalDate(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
  }

  /**
   * Parses an ISO 8601 date string (`YYYY-MM-DD`) into a `LocalDate`.
   *
   * @param iso - an ISO 8601 date string, e.g. `"1990-01-01"`
   * @returns the parsed `LocalDate`
   * @throws {Error} if the string does not match the `YYYY-MM-DD` pattern
   */
  static parse(iso: string): LocalDate {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
    if (!match) throw new Error(`Invalid ISO date string: ${iso}`);
    return new LocalDate(Number(match[1]), Number(match[2]), Number(match[3]));
  }

  /**
   * Computes the age in whole years between this date and a reference date.
   *
   * @param reference - the reference date; defaults to today via {@link LocalDate.now}
   * @returns age in whole years (minimum 0)
   */
  age(reference?: LocalDate): number {
    const ref = reference ?? LocalDate.now();
    let years = ref.year - this.year;
    if (ref.month < this.month || (ref.month === this.month && ref.day < this.day)) {
      years--;
    }
    return Math.max(0, years);
  }

  /**
   * Returns `true` if this date represents a valid calendar date.
   *
   * @returns `true` if the year, month, and day form a valid date
   */
  isValid(): boolean {
    if (this.month < 1 || this.month > 12 || this.day < 1 || this.year < 1) return false;
    const maxDay = new Date(this.year, this.month, 0).getDate();
    return this.day <= maxDay;
  }

  /**
   * Returns the date as an ISO 8601 string (`YYYY-MM-DD`).
   *
   * @returns the formatted date string, e.g. `"1990-01-01"`
   */
  toString(): string {
    return `${String(this.year).padStart(4, "0")}-${String(this.month).padStart(2, "0")}-${String(this.day).padStart(2, "0")}`;
  }

  /**
   * Returns `true` if this date is equal to `other`.
   *
   * @param other - the date to compare against
   * @returns `true` if year, month, and day are all equal
   */
  equals(other: LocalDate): boolean {
    return this.year === other.year && this.month === other.month && this.day === other.day;
  }
}
