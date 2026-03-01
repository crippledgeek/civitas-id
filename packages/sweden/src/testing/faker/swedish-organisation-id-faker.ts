import { LocalDate } from "@civitas-id/core";
import type { OrganisationIdFaker } from "@civitas-id/test-common";
import { ChecksumValidator } from "../../core/checksum-validator.js";
import { OrganisationId } from "../../core/swedish-ids.js";
import { IllegalIdNumberException } from "../../error/illegal-id-number-exception.js";
import { OrganisationNumberType } from "../../format/organisation-number-type.js";
import { PersonalIdFaker } from "./personal-id-faker.js";

const LEGAL_PERSON_CENTURY_PREFIX = "16";
const ORGANISATION_NUMBER_MINIMUM_MONTH = 20;
const ORGANISATION_NUMBER_MAXIMUM_MONTH = 99;

function randomInt(min: number, max: number): number {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return min + ((buf[0] as number) % (max - min));
}

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
  const checkDigit = ChecksumValidator.calculateCheckDigit(base);

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
    const registrationDate = LocalDate.of(year, month, dayOfMonth);
    if (!registrationDate.isValid()) {
      throw new IllegalIdNumberException("Invalid organisation ID: registration date is invalid");
    }
    return randomIdNumber(registrationDate);
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
