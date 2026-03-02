import { LocalDate } from "@deathbycode/civitas-id-core";
import type { PnrFormat } from "../format/pnr-format.js";
import { SwedishLuhnAlgorithm } from "../validation/swedish-luhn-algorithm.js";
import type { SwedishIdMatcher } from "./swedish-id-matcher.js";

/**
 * Shared logic for PersonalId and CoordinationId — century inference,
 * gender resolution, and age calculation.
 * Not exported from the public barrel.
 */

/**
 * Shared checksum validation for full 12-digit IDs (YYYYMMDD-XXXX).
 * Delegates date validation to the provided dateValidator.
 */
export function isIdNumberFull(full: string, dateValidator: (s: string) => boolean): boolean {
  if (!dateValidator(full)) return false;
  const tenDigits = full.substring(2, 8) + full.substring(9);
  return SwedishLuhnAlgorithm.isChecksumValid(tenDigits);
}

/**
 * Resolves the full 12-digit ID string from a short-format matcher,
 * inferring century and delimiter.
 */
export function getPossibleFullIdNumber(matcher: SwedishIdMatcher): string {
  const nowYear = new Date().getUTCFullYear();
  const twoDigitYear = matcher.getYear();
  const century = nowYear - (nowYear % 100);
  const rawBirthYear = century + twoDigitYear;
  const possibleBirthYear = rawBirthYear > nowYear ? rawBirthYear - 100 : rawBirthYear;

  if (!matcher.hasDelimiter() || matcher.getDelimiter() === "-") {
    return matcher.withBirthYearAndDelimiter(possibleBirthYear, "-");
  }
  // delimiter === "+"
  return matcher.withBirthYearAndDelimiter(possibleBirthYear - 100, "+");
}

const EARLIEST_ALLOWED_BIRTH_YEAR = 1880;

/**
 * Validates that a full 12-digit personal number (YYYYMMDD-XXXX or YYYYMMDD+XXXX)
 * has a valid date part.
 */
export function isValidPersonDate(fullPersonalNumber: string): boolean {
  const yearPart = Number.parseInt(fullPersonalNumber.substring(0, 4), 10);
  const monthPart = Number.parseInt(fullPersonalNumber.substring(4, 6), 10);
  const dayPart = Number.parseInt(fullPersonalNumber.substring(6, 8), 10);

  const birthDate = LocalDate.of(yearPart, monthPart, dayPart);
  if (!birthDate.isValid()) return false;
  if (yearPart < EARLIEST_ALLOWED_BIRTH_YEAR) return false;

  const nowYear = new Date().getUTCFullYear();
  const age = nowYear - yearPart;

  const delimiter = fullPersonalNumber.charAt(8);
  return (
    (age < 100 && delimiter === "-") || (age >= 100 && (delimiter === "-" || delimiter === "+"))
  );
}

/**
 * Validates that a full 12-digit coordination number has a valid date
 * (day >= 60).
 */
export function isValidCoordinationDate(fullCoordinationNumber: string): boolean {
  const datePart = fullCoordinationNumber.substring(0, 8);
  const dayStr = datePart.substring(6, 8);
  const day = Number.parseInt(dayStr, 10);
  if (Number.isNaN(day) || day < 61 || day > 91) return false;
  const actualDay = String(day - 60).padStart(2, "0");
  return isValidPersonDate(
    datePart.substring(0, 6) + actualDay + fullCoordinationNumber.substring(8),
  );
}

/**
 * Returns the gender digit from the internal 13-character storage format
 * (YYYYMMDD-BBBC or YYYYMMDD+BBBC). The gender digit is at index 11.
 */
export function getGenderDigit(longFormat: string): number {
  // Internal storage is YYYYMMDD-BBBC (13 chars with separator)
  // Gender digit is the 3rd birth number digit at index 11
  const ch = longFormat.charAt(11);
  if (ch < "0" || ch > "9") {
    throw new Error(
      `Internal error: invalid gender digit '${ch}' at index 11 in stored ID (length ${longFormat.length})`,
    );
  }
  return Number.parseInt(ch, 10);
}

export function isPersonalNumberFull(fullPersonalNumber: string): boolean {
  return isIdNumberFull(fullPersonalNumber, isValidPersonDate);
}

export function isCoordinationNumberFull(fullCoordinationNumber: string): boolean {
  return isIdNumberFull(fullCoordinationNumber, isValidCoordinationDate);
}

/**
 * Returns the formatted ID string for a given PnrFormat given the internal
 * 13-character storage format "YYYYMMDD-XXXX" or "YYYYMMDD+XXXX".
 */
export function formatPersonId(id: string, format: PnrFormat): string {
  switch (format) {
    case "LONG_FORMAT_WITH_SEPARATOR":
      return id;
    case "LONG_FORMAT_WITH_STANDARD_SEPARATOR":
      return `${id.substring(0, 8)}-${id.substring(9)}`;
    case "LONG_FORMAT":
      return id.substring(0, 8) + id.substring(9);
    case "SHORT_FORMAT_WITH_SEPARATOR":
      return id.substring(2);
    case "SHORT_FORMAT_WITH_STANDARD_SEPARATOR":
      return `${id.substring(2, 8)}-${id.substring(9)}`;
    case "SHORT_FORMAT":
      return id.substring(2, 8) + id.substring(9);
    default: {
      const _: never = format;
      throw new Error(`Unhandled PnrFormat: ${_}`);
    }
  }
}
