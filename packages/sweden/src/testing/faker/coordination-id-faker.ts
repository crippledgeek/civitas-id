import { LocalDate } from "@civitas-id/core";
import type { PersonIdFaker } from "@civitas-id/test-common";
import { CoordinationId } from "../../core/coordination-id.js";
import { InvalidIdNumberError } from "../../error/invalid-id-number-error.js";
import {
  buildIdString,
  makeFemaleBirthNumber,
  makeMaleBirthNumber,
  randomBirthDate,
  randomBirthNumber,
  randomInt,
} from "./faker-utils.js";

function createIdWithBirthNumber(birthDate: LocalDate, birthNumber: number): CoordinationId {
  const { base, checkDigit, age } = buildIdString(birthDate, birthNumber, 60);

  if (age >= 100) {
    return CoordinationId.parseOrThrow(`${base.substring(0, 6)}+${base.substring(6)}${checkDigit}`);
  }
  return CoordinationId.parseOrThrow(base + checkDigit);
}

/**
 * Faker for Swedish coordination IDs (samordningsnummer).
 */
export const CoordinationIdFaker: PersonIdFaker<CoordinationId> & {
  createMale(): CoordinationId;
  createFemale(): CoordinationId;
  createCentenarian(): CoordinationId;
} = {
  /**
   * Creates a random coordination ID, optionally for a specific birth date.
   *
   * @param date - optional birth date; random if omitted
   * @returns a valid {@link CoordinationId}
   */
  create(date?: LocalDate): CoordinationId {
    if (date && !date.isValid()) {
      throw new InvalidIdNumberError("Invalid coordination ID: birth date is invalid");
    }
    const birthDate = date ?? randomBirthDate();
    return createIdWithBirthNumber(birthDate, randomBirthNumber());
  },

  /**
   * @param year - four-digit birth year
   * @param month - birth month (1-12)
   * @param dayOfMonth - birth day (1-31)
   * @returns a valid {@link CoordinationId} for the specified date
   * @throws {IllegalIdNumberException} if the birth date is invalid
   */
  createFor(year: number, month: number, dayOfMonth: number): CoordinationId {
    const birthDate = LocalDate.of(year, month, dayOfMonth);
    if (!birthDate.isValid()) {
      throw new InvalidIdNumberError("Invalid coordination ID: birth date is invalid");
    }
    return createIdWithBirthNumber(birthDate, randomBirthNumber());
  },

  /**
   * Creates a random valid coordination ID with a male birth number (odd third digit).
   * @returns a valid {@link CoordinationId} with a male birth number
   */
  createMale(): CoordinationId {
    const birthDate = randomBirthDate();
    const birthNumber = makeMaleBirthNumber(randomBirthNumber());
    return createIdWithBirthNumber(birthDate, birthNumber);
  },

  /**
   * Creates a random valid coordination ID with a female birth number (even third digit).
   * @returns a valid {@link CoordinationId} with a female birth number
   */
  createFemale(): CoordinationId {
    const birthDate = randomBirthDate();
    const birthNumber = makeFemaleBirthNumber(randomBirthNumber());
    return createIdWithBirthNumber(birthDate, birthNumber);
  },

  /**
   * Creates a random valid coordination ID for a person who is 100-110 years old (uses `+` separator).
   * @returns a valid {@link CoordinationId} with a `+` separator
   */
  createCentenarian(): CoordinationId {
    const now = LocalDate.now();
    const yearsOld = 100 + randomInt(0, 11);
    const year = now.year - yearsOld;
    const birthDate = LocalDate.of(year, now.month, 1);
    return createIdWithBirthNumber(birthDate, randomBirthNumber());
  },

  /**
   * @returns the ISO 3166-1 alpha-2 country code `"SE"`
   */
  getCountryCode(): string {
    return "SE";
  },
};
