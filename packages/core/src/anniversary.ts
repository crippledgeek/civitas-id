import type { LocalDate } from "./local-date.js";

/**
 * Resolves the anniversary date of `birth` in a given calendar `year`.
 *
 * Per-country packages implement this to encode jurisdictional rules
 * for leap-day birthdays. Sweden (Lag 1930:173 §1) returns Feb-28 in
 * non-leap years; Germany (BGB §187 II + §188 III) returns Mar-1; etc.
 */
export interface AnniversaryResolver {
  /**
   * Returns the anniversary date of `birth` in the given calendar `year`.
   *
   * @param birth - the original birth date
   * @param year - the calendar year in which to compute the anniversary
   * @returns the anniversary `LocalDate` for that year
   */
  resolve(birth: LocalDate, year: number): LocalDate;
}

/**
 * Returns the year-age of a person born `birth` as of `today`,
 * delegating leap-day handling to the supplied jurisdiction resolver.
 *
 * `today` is always supplied by the caller; this function never reads
 * a clock. Country packages provide `today` from a TZ-pinned helper
 * (e.g. `todayInSweden()`).
 *
 * @param birth - the person's date of birth
 * @param today - the reference date (caller-supplied; no clock is read)
 * @param resolver - jurisdiction-specific anniversary resolver
 * @returns age in whole completed years (minimum 0)
 */
export function computeAge(
  birth: LocalDate,
  today: LocalDate,
  resolver: AnniversaryResolver,
): number {
  let years = today.year - birth.year;
  const anniv = resolver.resolve(birth, today.year);
  if (today.month < anniv.month || (today.month === anniv.month && today.day < anniv.day)) {
    years--;
  }
  return Math.max(0, years);
}
