import { LocalDate } from "@civitas-id/core";
import type { OrganisationIdFaker } from "@civitas-id/test-common";
import { ORGANISATION_NUMBER_MINIMUM_MONTH, OrganisationId } from "../../core/organisation-id.js";
import { LEGAL_PERSON_CENTURY_PREFIX } from "../../core/swedish-id-matcher.js";
import { InvalidIdNumberError } from "../../error/invalid-id-number-error.js";
import { OrganisationNumberType } from "../../format/organisation-number-type.js";
import { SwedishLuhnAlgorithm } from "../../validation/swedish-luhn-algorithm.js";
import { randomInt } from "./faker-utils.js";
import { PersonalIdFaker } from "./personal-id-faker.js";

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
  const encodedMonth = registrationDate.month + ORGANISATION_NUMBER_MINIMUM_MONTH;
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
export const SwedishOrganisationIdFaker: OrganisationIdFaker<OrganisationId> & {
  createLegalPerson(): OrganisationId;
  createPhysicalPerson(): OrganisationId;
} = {
  /**
   * Creates a random organisation ID, optionally for a specific registration date.
   *
   * @param date - optional registration date; random if omitted
   * @returns a valid {@link OrganisationId}
   */
  create(date?: LocalDate): OrganisationId {
    return randomIdNumber(date ?? randomRegistrationDate());
  },

  /**
   * @param year - four-digit registration year
   * @param month - registration month (1-12)
   * @param dayOfMonth - registration day (1-31)
   * @returns a valid {@link OrganisationId} for the specified date
   * @throws {InvalidIdNumberError} if the registration date is invalid
   */
  createFor(year: number, month: number, dayOfMonth: number): OrganisationId {
    return randomIdNumber(LocalDate.of(year, month, dayOfMonth));
  },

  /**
   * Creates a random valid organisation ID for a legal person (juridisk person).
   * @returns a valid {@link OrganisationId} of type LEGAL_PERSON
   */
  createLegalPerson(): OrganisationId {
    return randomIdNumber(randomRegistrationDate());
  },

  /**
   * Creates a random valid organisation ID derived from a {@link PersonalId} (physical person as sole trader).
   * @returns a valid {@link OrganisationId} of type PHYSICAL_PERSON
   */
  createPhysicalPerson(): OrganisationId {
    return PersonalIdFaker.create().toOrganisationId();
  },

  /**
   * @returns the ISO 3166-1 alpha-2 country code `"SE"`
   */
  getCountryCode(): string {
    return "SE";
  },
};
