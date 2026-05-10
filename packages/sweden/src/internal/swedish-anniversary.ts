import { type AnniversaryResolver, LocalDate } from "@deathbycode/civitas-id-core";

/**
 * Swedish anniversary rule per **Lag (1930:173) §1**:
 *
 *   "Finnes ej motsvarande dag i slutmånaden, varde den månadens sista
 *    dag ansedd för slutdag."
 *
 * A person born 29 February attains each year-age on **28 February**
 * in non-leap years and on **29 February** in leap years. All other
 * birthdays attain age on the literal birthday in the target year.
 */
export const swedishAnniversaryResolver: AnniversaryResolver = {
  resolve(birth, year) {
    if (birth.month === 2 && birth.day === 29 && !isLeapYear(year)) {
      return LocalDate.of(year, 2, 28);
    }
    return LocalDate.of(year, birth.month, birth.day);
  },
};

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}
