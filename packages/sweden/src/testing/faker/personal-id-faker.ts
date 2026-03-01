import { LocalDate } from "@civitas-id/core";
import type { PersonIdFaker } from "@civitas-id/test-common";
import { ChecksumValidator } from "../../core/checksum-validator.js";
import { PersonalId } from "../../core/swedish-ids.js";
import { IllegalIdNumberException } from "../../error/illegal-id-number-exception.js";

function randomInt(min: number, max: number): number {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return min + ((buf[0] as number) % (max - min));
}

function randomBirthDate(): LocalDate {
  let date: LocalDate;
  do {
    const year = randomInt(1970, 2020);
    const month = randomInt(1, 13);
    const day = randomInt(1, 29);
    date = LocalDate.of(year, month, day);
  } while (!date.isValid());
  return date;
}

function randomBirthNumber(): number {
  return randomInt(0, 1000);
}

function createIdWithBirthNumber(birthDate: LocalDate, birthNumber: number): PersonalId {
  const yy = String(birthDate.year % 100).padStart(2, "0");
  const mm = String(birthDate.month).padStart(2, "0");
  const dd = String(birthDate.day).padStart(2, "0");
  const bbb = String(birthNumber).padStart(3, "0");

  const base = yy + mm + dd + bbb;
  const checkDigit = ChecksumValidator.calculateCheckDigit(base);

  const now = LocalDate.now();
  const age = birthDate.age(now);

  if (age >= 100) {
    return PersonalId.parseOrThrow(`${base.substring(0, 6)}+${base.substring(6)}${checkDigit}`);
  }
  return PersonalId.parseOrThrow(base + checkDigit);
}

/**
 * Faker for Swedish personal IDs (personnummer).
 */
export class PersonalIdFaker implements PersonIdFaker<PersonalId> {
  static personalId(): PersonalIdFaker {
    return new PersonalIdFaker();
  }

  create(): PersonalId;
  create(date: LocalDate): PersonalId;
  create(date?: LocalDate): PersonalId {
    const birthDate = date ?? randomBirthDate();
    return createIdWithBirthNumber(birthDate, randomBirthNumber());
  }

  createFor(year: number, month: number, dayOfMonth: number): PersonalId {
    const birthDate = LocalDate.of(year, month, dayOfMonth);
    if (!birthDate.isValid()) {
      throw new IllegalIdNumberException("Invalid personal ID: birth date is invalid");
    }
    return createIdWithBirthNumber(birthDate, randomBirthNumber());
  }

  createMale(): PersonalId {
    const birthDate = randomBirthDate();
    let birthNumber = randomBirthNumber();
    birthNumber = Math.floor(birthNumber / 10) * 10 + ((birthNumber % 10) | 1);
    return createIdWithBirthNumber(birthDate, birthNumber);
  }

  createFemale(): PersonalId {
    const birthDate = randomBirthDate();
    let birthNumber = randomBirthNumber();
    birthNumber = Math.floor(birthNumber / 10) * 10 + ((birthNumber % 10) & ~1);
    return createIdWithBirthNumber(birthDate, birthNumber);
  }

  createCentenarian(): PersonalId {
    const now = LocalDate.now();
    const yearsOld = 100 + randomInt(0, 11);
    const year = now.year - yearsOld;
    const candidate = LocalDate.of(year, now.month, now.day);
    const birthDate = candidate.isValid() ? candidate : LocalDate.of(year, now.month, 1);
    return createIdWithBirthNumber(birthDate, randomBirthNumber());
  }

  getCountryCode(): string {
    return "SE";
  }
}
