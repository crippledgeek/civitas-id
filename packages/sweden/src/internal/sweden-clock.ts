import { LocalDate } from "@deathbycode/civitas-id-core";

/**
 * Stockholm civil date formatter.
 *
 * Resolves through IANA `Europe/Stockholm`, which composes Förordning
 * (1979:988) om svensk normaltid (CET, UTC+1) and Förordning (2001:127)
 * om sommartid (CEST, UTC+2; last-Sun-Mar 02:00 / last-Sun-Oct 03:00).
 *
 * `en-CA` produces ISO-style `YYYY-MM-DD` parts which we read via
 * `formatToParts` for robustness against locale-data variation.
 */
const STOCKHOLM_DATE_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Stockholm",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/**
 * Returns the calendar date currently in force in Sweden's civil
 * timezone (`Europe/Stockholm`).
 *
 * This is the legally correct anchor for any age, century-inference,
 * or centenarian-`+`-separator decision under Swedish statute. UTC
 * and process-local time are NOT acceptable substitutes.
 *
 * @returns the current Stockholm calendar date as a {@link LocalDate}
 */
export function todayInSweden(): LocalDate {
  const parts = STOCKHOLM_DATE_FORMATTER.formatToParts(new Date());
  let year = 0;
  let month = 0;
  let day = 0;
  for (const part of parts) {
    if (part.type === "year") year = Number(part.value);
    else if (part.type === "month") month = Number(part.value);
    else if (part.type === "day") day = Number(part.value);
  }
  return LocalDate.of(year, month, day);
}
