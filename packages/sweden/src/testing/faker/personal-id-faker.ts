import { LocalDate } from "@deathbycode/civitas-id-core";
import { PersonalId } from "../../core/personal-id.js";
import { InvalidIdNumberError } from "../../error/invalid-id-number-error.js";
import type { PersonIdFaker } from "./faker-types.js";
import {
  buildIdString,
  makeFemaleBirthNumber,
  makeMaleBirthNumber,
  randomBirthDate,
  randomBirthNumber,
  randomInt,
} from "./faker-utils.js";

function createIdWithBirthNumber(birthDate: LocalDate, birthNumber: number): PersonalId {
  const { base, checkDigit, age } = buildIdString(birthDate, birthNumber, 0);

  if (age >= 100) {
    return PersonalId.parseOrThrow(`${base.substring(0, 6)}+${base.substring(6)}${checkDigit}`);
  }
  return PersonalId.parseOrThrow(base + checkDigit);
}

/**
 * Faker for Swedish personal IDs (personnummer).
 */
export const PersonalIdFaker: PersonIdFaker<PersonalId> & {
  createMale(): PersonalId;
  createFemale(): PersonalId;
  createCentenarian(): PersonalId;
} = {
  /**
   * Creates a random personal ID, optionally for a specific birth date.
   *
   * @param date - optional birth date; random if omitted
   * @returns a valid {@link PersonalId}
   * @throws {InvalidIdNumberError} if the supplied date is invalid
   */
  create(date?: LocalDate): PersonalId {
    if (date && !date.isValid()) {
      throw new InvalidIdNumberError("Invalid personal ID: birth date is invalid");
    }
    const birthDate = date ?? randomBirthDate();
    return createIdWithBirthNumber(birthDate, randomBirthNumber());
  },

  /**
   * @param year - four-digit birth year
   * @param month - birth month (1-12)
   * @param dayOfMonth - birth day (1-31)
   * @returns a valid {@link PersonalId} for the specified date
   * @throws {InvalidIdNumberError} if the birth date is invalid
   */
  createFor(year: number, month: number, dayOfMonth: number): PersonalId {
    const birthDate = LocalDate.of(year, month, dayOfMonth);
    if (!birthDate.isValid()) {
      throw new InvalidIdNumberError("Invalid personal ID: birth date is invalid");
    }
    return createIdWithBirthNumber(birthDate, randomBirthNumber());
  },

  /**
   * Creates a random valid personal ID with a male birth number (odd third digit).
   * @returns a valid {@link PersonalId} with a male birth number
   */
  createMale(): PersonalId {
    const birthDate = randomBirthDate();
    const birthNumber = makeMaleBirthNumber(randomBirthNumber());
    return createIdWithBirthNumber(birthDate, birthNumber);
  },

  /**
   * Creates a random valid personal ID with a female birth number (even third digit).
   * @returns a valid {@link PersonalId} with a female birth number
   */
  createFemale(): PersonalId {
    const birthDate = randomBirthDate();
    const birthNumber = makeFemaleBirthNumber(randomBirthNumber());
    return createIdWithBirthNumber(birthDate, birthNumber);
  },

  /**
   * Creates a random valid personal ID for a person who is 100-110 years old (uses `+` separator).
   * @returns a valid {@link PersonalId} with a `+` separator
   */
  createCentenarian(): PersonalId {
    const now = LocalDate.now();
    const yearsOld = 100 + randomInt(0, 11);
    const year = now.year - yearsOld;
    const candidate = LocalDate.of(year, now.month, now.day);
    const birthDate = candidate.isValid() ? candidate : LocalDate.of(year, now.month, 1);
    return createIdWithBirthNumber(birthDate, randomBirthNumber());
  },

  /**
   * @returns the ISO 3166-1 alpha-2 country code `"SE"`
   */
  getCountryCode(): string {
    return "SE";
  },
};
