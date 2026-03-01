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
  create(date?: LocalDate): CoordinationId {
    if (date && !date.isValid()) {
      throw new InvalidIdNumberError("Invalid coordination ID: birth date is invalid");
    }
    const birthDate = date ?? randomBirthDate();
    return createIdWithBirthNumber(birthDate, randomBirthNumber());
  },

  createFor(year: number, month: number, dayOfMonth: number): CoordinationId {
    const birthDate = LocalDate.of(year, month, dayOfMonth);
    if (!birthDate.isValid()) {
      throw new InvalidIdNumberError("Invalid coordination ID: birth date is invalid");
    }
    return createIdWithBirthNumber(birthDate, randomBirthNumber());
  },

  createMale(): CoordinationId {
    const birthDate = randomBirthDate();
    const birthNumber = makeMaleBirthNumber(randomBirthNumber());
    return createIdWithBirthNumber(birthDate, birthNumber);
  },

  createFemale(): CoordinationId {
    const birthDate = randomBirthDate();
    const birthNumber = makeFemaleBirthNumber(randomBirthNumber());
    return createIdWithBirthNumber(birthDate, birthNumber);
  },

  createCentenarian(): CoordinationId {
    const now = LocalDate.now();
    const yearsOld = 100 + randomInt(0, 11);
    const year = now.year - yearsOld;
    const birthDate = LocalDate.of(year, now.month, 1);
    return createIdWithBirthNumber(birthDate, randomBirthNumber());
  },

  getCountryCode(): string {
    return "SE";
  },
};
