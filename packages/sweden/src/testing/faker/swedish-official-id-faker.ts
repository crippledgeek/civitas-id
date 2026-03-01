import { LocalDate } from "@civitas-id/core";
import type { IdFaker } from "@civitas-id/test-common";
import { CoordinationId } from "../../core/coordination-id.js";
import type { PersonalId } from "../../core/personal-id.js";
import type { SwedishOfficialId } from "../../core/swedish-official-id.js";
import { SwedishLuhnAlgorithm } from "../../validation/swedish-luhn-algorithm.js";
import { randomInt } from "./faker-utils.js";
import { PersonalIdFaker } from "./personal-id-faker.js";
import { SwedishOrganisationIdFaker } from "./swedish-organisation-id-faker.js";

function toCoordinationId(personalId: PersonalId): CoordinationId {
  // longFormat() returns YYYYMMDDBBBC (12 chars, no separator)
  const idStr = personalId.longFormat();
  const year = idStr.substring(0, 4);
  const month = idStr.substring(4, 6);
  const day = idStr.substring(6, 8);
  const birthNumber = idStr.substring(8, 11);

  const dayValue = Number.parseInt(day, 10);
  const coordDay = String(dayValue + 60).padStart(2, "0");

  const base = year.substring(2) + month + coordDay + birthNumber;
  const checkDigit = SwedishLuhnAlgorithm.calculateCheckDigit(base);

  return CoordinationId.parseOrThrow(year + month + coordDay + birthNumber + checkDigit);
}

/**
 * Faker for any type of Swedish official ID (PersonalId, CoordinationId, OrganisationId).
 */
export const SwedishOfficialIdFaker: IdFaker<SwedishOfficialId> & {
  createMany(count: number): ReadonlyArray<SwedishOfficialId>;
} = {
  create(date?: LocalDate): SwedishOfficialId {
    const choice = randomInt(0, 3);

    if (choice === 0) {
      return date ? PersonalIdFaker.create(date) : PersonalIdFaker.create();
    }
    if (choice === 1) {
      // Derive coordination ID from a personal ID
      const personalId = date ? PersonalIdFaker.create(date) : PersonalIdFaker.create();
      return toCoordinationId(personalId);
    }
    return date ? SwedishOrganisationIdFaker.create(date) : SwedishOrganisationIdFaker.create();
  },

  createFor(year: number, month: number, dayOfMonth: number): SwedishOfficialId {
    return SwedishOfficialIdFaker.create(LocalDate.of(year, month, dayOfMonth));
  },

  createMany(count: number): ReadonlyArray<SwedishOfficialId> {
    return Array.from({ length: count }, () => SwedishOfficialIdFaker.create());
  },

  getCountryCode(): string {
    return "SE";
  },
};
