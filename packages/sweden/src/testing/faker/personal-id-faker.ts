import { LocalDate } from "@civitas-id/core";
import type { PersonIdFaker } from "@civitas-id/test-common";
import { PersonalId } from "../../core/personal-id.js";
import { InvalidIdNumberError } from "../../error/invalid-id-number-error.js";
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
  create(date?: LocalDate): PersonalId {
    const birthDate = date ?? randomBirthDate();
    return createIdWithBirthNumber(birthDate, randomBirthNumber());
  },

  createFor(year: number, month: number, dayOfMonth: number): PersonalId {
    const birthDate = LocalDate.of(year, month, dayOfMonth);
    if (!birthDate.isValid()) {
      throw new InvalidIdNumberError("Invalid personal ID: birth date is invalid");
    }
    return createIdWithBirthNumber(birthDate, randomBirthNumber());
  },

  createMale(): PersonalId {
    const birthDate = randomBirthDate();
    const birthNumber = makeMaleBirthNumber(randomBirthNumber());
    return createIdWithBirthNumber(birthDate, birthNumber);
  },

  createFemale(): PersonalId {
    const birthDate = randomBirthDate();
    const birthNumber = makeFemaleBirthNumber(randomBirthNumber());
    return createIdWithBirthNumber(birthDate, birthNumber);
  },

  createCentenarian(): PersonalId {
    const now = LocalDate.now();
    const yearsOld = 100 + randomInt(0, 11);
    const year = now.year - yearsOld;
    const candidate = LocalDate.of(year, now.month, now.day);
    const birthDate = candidate.isValid() ? candidate : LocalDate.of(year, now.month, 1);
    return createIdWithBirthNumber(birthDate, randomBirthNumber());
  },

  getCountryCode(): string {
    return "SE";
  },
};
