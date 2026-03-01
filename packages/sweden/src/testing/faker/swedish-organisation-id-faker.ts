import { LocalDate } from "@civitas-id/core";
import type { OrganisationIdFaker } from "@civitas-id/test-common";
import { ORGANISATION_NUMBER_MINIMUM_MONTH } from "../../core/organisation-id.js";
import { LEGAL_PERSON_CENTURY_PREFIX } from "../../core/swedish-id-matcher.js";
import { OrganisationId } from "../../core/swedish-ids.js";
import { IllegalIdNumberException } from "../../error/illegal-id-number-exception.js";
import { OrganisationNumberType } from "../../format/organisation-number-type.js";
import { SwedishLuhnAlgorithm } from "../../validation/swedish-luhn-algorithm.js";
import { randomInt } from "./faker-utils.js";
import { PersonalIdFaker } from "./personal-id-faker.js";

const ORGANISATION_NUMBER_MAXIMUM_MONTH = 99;

function randomRegistrationDate(): LocalDate {
  const month = randomInt(ORGANISATION_NUMBER_MINIMUM_MONTH, ORGANISATION_NUMBER_MAXIMUM_MONTH + 1);
  const day = randomInt(1, 100);

  const now = LocalDate.now();
  const effectiveMonth = month > 12 ? 1 : month;
  const effectiveDay = day > 28 ? 1 : day;
  return LocalDate.of(now.year, effectiveMonth, effectiveDay);
}

function randomIdNumber(registrationDate: LocalDate): OrganisationId {
  const uniqueNumber = randomInt(0, 1000);
  const yy = String(registrationDate.year % 100).padStart(2, "0");
  const mm = String(ORGANISATION_NUMBER_MINIMUM_MONTH).padStart(2, "0");
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
  /**
   * Creates a new {@link SwedishOrganisationIdFaker} instance.
   *
   * @example
   * const faker = SwedishOrganisationIdFaker.organisationId();
   * const id = faker.create();
   */
  static organisationId(): SwedishOrganisationIdFaker {
    return new SwedishOrganisationIdFaker();
  }

  /** Creates a random organisation ID with a random registration date. */
  create(): OrganisationId;
  /** Creates a random organisation ID for the given registration date. @param date - the registration date */
  create(date: LocalDate): OrganisationId;
  /**
   * @param date - optional registration date; random if omitted
   * @returns a valid {@link OrganisationId}
   */
  create(date?: LocalDate): OrganisationId {
    return randomIdNumber(date ?? randomRegistrationDate());
  }

  /**
   * @param year - four-digit registration year
   * @param month - registration month (1–12)
   * @param dayOfMonth - registration day (1–31)
   * @returns a valid {@link OrganisationId} for the specified date
   * @throws {IllegalIdNumberException} if the registration date is invalid
   */
  createFor(year: number, month: number, dayOfMonth: number): OrganisationId {
    const registrationDate = LocalDate.of(year, month, dayOfMonth);
    if (!registrationDate.isValid()) {
      throw new IllegalIdNumberException("Invalid organisation ID: registration date is invalid");
    }
    return randomIdNumber(registrationDate);
  }

  /**
   * Creates a random valid organisation ID for a legal person (juridisk person).
   * @returns a valid {@link OrganisationId} of type LEGAL_PERSON
   */
  createLegalPerson(): OrganisationId {
    return randomIdNumber(randomRegistrationDate());
  }

  /**
   * Creates a random valid organisation ID derived from a {@link PersonalId} (physical person as sole trader).
   * @returns a valid {@link OrganisationId} of type PHYSICAL_PERSON
   */
  createPhysicalPerson(): OrganisationId {
    const personalId = PersonalIdFaker.personalId().create();
    return personalId.toOrganisationId();
  }

  /**
   * @returns the ISO 3166-1 alpha-2 country code `"SE"`
   */
  getCountryCode(): string {
    return "SE";
  }
}
