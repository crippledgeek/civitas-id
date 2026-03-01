import { CoordinationId, OrganisationId, type PersonalId } from "../../core/swedish-ids.js";
import type { SwedishOfficialId } from "../../core/swedish-ids.js";
import { SwedishLuhnAlgorithm } from "../../validation/swedish-luhn-algorithm.js";
import { randomInt } from "./faker-utils.js";
import { PersonalIdFaker } from "./personal-id-faker.js";
import { SwedishOrganisationIdFaker } from "./swedish-organisation-id-faker.js";

/**
 * Faker for any type of Swedish official ID (PersonalId, CoordinationId, OrganisationId).
 */
export class SwedishOfficialIdFaker {
  static swedishOfficialId(): SwedishOfficialIdFaker {
    return new SwedishOfficialIdFaker();
  }

  create(): SwedishOfficialId {
    const choice = randomInt(0, 3);

    if (choice === 0) {
      return PersonalIdFaker.personalId().create();
    }
    if (choice === 1) {
      // Derive coordination ID from a personal ID
      const personalId = PersonalIdFaker.personalId().create();
      return this.toCoordinationId(personalId);
    }
    return SwedishOrganisationIdFaker.organisationId().create();
  }

  createMany(count: number): SwedishOfficialId[] {
    const results: SwedishOfficialId[] = [];
    for (let i = 0; i < count; i++) {
      results.push(this.create());
    }
    return results;
  }

  private toCoordinationId(personalId: PersonalId): CoordinationId {
    // longFormat is YYYYMMDD-XXXX or YYYYMMDD+XXXX
    const idStr = personalId.longFormat();
    const year = idStr.substring(0, 4);
    const month = idStr.substring(4, 6);
    const day = idStr.substring(6, 8);
    const birthNumber = idStr.substring(9, 12);

    const dayValue = Number.parseInt(day, 10);
    const coordDay = String(dayValue + 60).padStart(2, "0");

    const base = year.substring(2) + month + coordDay + birthNumber;
    const checkDigit = SwedishLuhnAlgorithm.calculateCheckDigit(base);

    return CoordinationId.parseOrThrow(year + month + coordDay + birthNumber + checkDigit);
  }
}
