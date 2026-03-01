import { LocalDate } from "@civitas-id/core";
import type { OrganisationIdFaker } from "@civitas-id/test-common";
import { OrganisationId } from "../../core/organisation-id.js";
import { LEGAL_PERSON_CENTURY_PREFIX } from "../../core/swedish-id-matcher.js";
import { InvalidIdNumberError } from "../../error/invalid-id-number-error.js";
import { OrganisationNumberType } from "../../format/organisation-number-type.js";
import { SwedishLuhnAlgorithm } from "../../validation/swedish-luhn-algorithm.js";
import { randomInt } from "./faker-utils.js";
import { PersonalIdFaker } from "./personal-id-faker.js";

const LEGAL_PERSON_MINIMUM_MONTH = 20;

function randomRegistrationDate(): LocalDate {
  const month = randomInt(1, 13);
  const day = randomInt(1, 29);
  return LocalDate.of(LocalDate.now().year, month, day);
}

function randomIdNumber(registrationDate: LocalDate): OrganisationId {
  if (!registrationDate.isValid()) {
    throw new InvalidIdNumberError("Invalid organisation ID: registration date is invalid");
  }
  const uniqueNumber = randomInt(0, 1000);
  const yy = String(registrationDate.year % 100).padStart(2, "0");
  const encodedMonth = registrationDate.month + LEGAL_PERSON_MINIMUM_MONTH;
  const mm = String(encodedMonth).padStart(2, "0");
  const dd = String(registrationDate.day).padStart(2, "0");
  const uuu = String(uniqueNumber).padStart(3, "0");

  const base = yy + mm + dd + uuu;
  const checkDigit = SwedishLuhnAlgorithm.calculateCheckDigit(base);

  return OrganisationId.parseOrThrow(
    LEGAL_PERSON_CENTURY_PREFIX + base + checkDigit,
    OrganisationNumberType.LEGAL_PERSON,
  );
}

/**
 * Faker for Swedish organisation IDs (organisationsnummer).
 */
export class SwedishOrganisationIdFaker implements OrganisationIdFaker<OrganisationId> {
  static organisationId(): SwedishOrganisationIdFaker {
    return new SwedishOrganisationIdFaker();
  }

  create(): OrganisationId;
  create(date: LocalDate): OrganisationId;
  create(date?: LocalDate): OrganisationId {
    return randomIdNumber(date ?? randomRegistrationDate());
  }

  createFor(year: number, month: number, dayOfMonth: number): OrganisationId {
    return randomIdNumber(LocalDate.of(year, month, dayOfMonth));
  }

  createLegalPerson(): OrganisationId {
    return randomIdNumber(randomRegistrationDate());
  }

  createPhysicalPerson(): OrganisationId {
    const personalId = PersonalIdFaker.personalId().create();
    return personalId.toOrganisationId();
  }

  getCountryCode(): string {
    return "SE";
  }
}
