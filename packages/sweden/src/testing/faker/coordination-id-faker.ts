import { LocalDate } from "@civitas-id/core";
import type { PersonIdFaker } from "@civitas-id/test-common";
import { ChecksumValidator } from "../../core/checksum-validator.js";
import { CoordinationId } from "../../core/swedish-ids.js";
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

function createIdWithBirthNumber(birthDate: LocalDate, birthNumber: number): CoordinationId {
  const coordDay = birthDate.day + 60;
  const yy = String(birthDate.year % 100).padStart(2, "0");
  const mm = String(birthDate.month).padStart(2, "0");
  const dd = String(coordDay).padStart(2, "0");
  const bbb = String(birthNumber).padStart(3, "0");

  const base = yy + mm + dd + bbb;
  const checkDigit = ChecksumValidator.calculateCheckDigit(base);

  const now = LocalDate.now();
  const age = birthDate.age(now);

  if (age >= 100) {
    return CoordinationId.parseOrThrow(`${base.substring(0, 6)}+${base.substring(6)}${checkDigit}`);
  }
  return CoordinationId.parseOrThrow(base + checkDigit);
}

/**
 * Faker for Swedish coordination IDs (samordningsnummer).
 */
export class CoordinationIdFaker implements PersonIdFaker<CoordinationId> {
  static coordinationId(): CoordinationIdFaker {
    return new CoordinationIdFaker();
  }

  create(): CoordinationId;
  create(date: LocalDate): CoordinationId;
  create(date?: LocalDate): CoordinationId {
    const birthDate = date ?? randomBirthDate();
    return createIdWithBirthNumber(birthDate, randomBirthNumber());
  }

  createFor(year: number, month: number, dayOfMonth: number): CoordinationId {
    const birthDate = LocalDate.of(year, month, dayOfMonth);
    if (!birthDate.isValid()) {
      throw new IllegalIdNumberException("Invalid coordination ID: birth date is invalid");
    }
    return createIdWithBirthNumber(birthDate, randomBirthNumber());
  }

  createMale(): CoordinationId {
    const birthDate = randomBirthDate();
    let birthNumber = randomBirthNumber();
    birthNumber = Math.floor(birthNumber / 10) * 10 + ((birthNumber % 10) | 1);
    return createIdWithBirthNumber(birthDate, birthNumber);
  }

  createFemale(): CoordinationId {
    const birthDate = randomBirthDate();
    let birthNumber = randomBirthNumber();
    birthNumber = Math.floor(birthNumber / 10) * 10 + ((birthNumber % 10) & ~1);
    return createIdWithBirthNumber(birthDate, birthNumber);
  }

  createCentenarian(): CoordinationId {
    const now = LocalDate.now();
    const yearsOld = 100 + randomInt(0, 11);
    const year = now.year - yearsOld;
    const birthDate = LocalDate.of(year, now.month, 1);
    return createIdWithBirthNumber(birthDate, randomBirthNumber());
  }

  getCountryCode(): string {
    return "SE";
  }
}
