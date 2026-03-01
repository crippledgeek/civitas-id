import type { LocalDate } from "@civitas-id/core";
import type { OrganisationOfficialId } from "@civitas-id/core";
import { IllegalIdNumberException } from "../error/illegal-id-number-exception.js";
import { OrganisationForm } from "../format/organisation-form.js";
import type { OrganisationFormEntry } from "../format/organisation-form.js";
import { OrganisationNumberType } from "../format/organisation-number-type.js";
import { PnrFormat } from "../format/pnr-format.js";
import { SwedishLuhnAlgorithm } from "../validation/swedish-luhn-algorithm.js";
import { CoordinationId, isCoordinationNumberFull } from "./coordination-id.js";
import type { PersonOfficialIdBase } from "./coordination-id.js";
import { getPossibleFullIdNumber } from "./person-official-id-base.js";
import { PersonalId, isPersonalNumberFull } from "./personal-id.js";
import { LEGAL_PERSON_CENTURY_PREFIX, createMatcher } from "./swedish-id-matcher.js";

export const ORGANISATION_NUMBER_MINIMUM_MONTH = 20;

function formatOrgId(id: string, format: PnrFormat): string {
  // id is stored internally as "16NNNNNN-NNNN" or "16NNNNNN+NNNN"
  // Output is always 10-digit (skip "16" prefix)
  const datePart = id.substring(2, 8); // NNNNNN
  const serialPart = id.substring(9); // NNNN

  switch (format) {
    case "LONG_FORMAT_WITH_SEPARATOR":
    case "SHORT_FORMAT_WITH_SEPARATOR":
      return id.substring(2); // NNNNNN-NNNN (keep original separator)
    case "LONG_FORMAT_WITH_STANDARD_SEPARATOR":
    case "SHORT_FORMAT_WITH_STANDARD_SEPARATOR":
      return `${datePart}-${serialPart}`;
    case "LONG_FORMAT":
    case "SHORT_FORMAT":
      return datePart + serialPart;
  }
}

function isOrganisationNumber(full: string): boolean {
  const separator = full.charAt(8);
  if (separator !== "-" && separator !== "+") return false;
  if (full.substring(0, 2) !== LEGAL_PERSON_CENTURY_PREFIX) return false;
  const month = Number.parseInt(full.substring(4, 6), 10);
  if (month < ORGANISATION_NUMBER_MINIMUM_MONTH) return false;
  const tenDigits = full.substring(2, 8) + full.substring(9);
  return SwedishLuhnAlgorithm.isChecksumValid(tenDigits);
}

function isValidPerson(full: string, type: OrganisationNumberType): boolean {
  switch (type) {
    case OrganisationNumberType.LEGAL_PERSON:
      return isOrganisationNumber(full);
    case OrganisationNumberType.PHYSICAL_PERSON:
      return isPersonalNumberFull(full) || isCoordinationNumberFull(full);
    case OrganisationNumberType.LEGAL_OR_PHYSICAL_PERSON:
      return (
        isOrganisationNumber(full) || isPersonalNumberFull(full) || isCoordinationNumberFull(full)
      );
  }
}

/**
 * Represents a Swedish organisation number (organisationsnummer).
 * Input: accepts 10-digit or 12-digit (16-prefix legacy) format.
 * Output: always normalized to official 10-digit format.
 */
export class OrganisationId implements OrganisationOfficialId<PnrFormat> {
  readonly type = "ORGANISATION" as const;

  private constructor(private readonly _id: string) {}

  static parse(text: string | null | undefined): OrganisationId | undefined {
    return OrganisationId.parseWithType(
      text as string,
      OrganisationNumberType.LEGAL_OR_PHYSICAL_PERSON,
    );
  }

  static parseWithType(
    text: string | null | undefined,
    type: OrganisationNumberType,
  ): OrganisationId | undefined {
    try {
      return OrganisationId.parseOrThrow(text as string, type);
    } catch {
      return undefined;
    }
  }

  static parseOrThrow(
    text: string,
    type: OrganisationNumberType = OrganisationNumberType.LEGAL_OR_PHYSICAL_PERSON,
  ): OrganisationId {
    const m = createMatcher(text);
    if (m.noMatch()) throw new IllegalIdNumberException(`Invalid organisation ID: ${text}`);

    let full: string;
    if (m.hasCentury()) {
      full = m.getLongFormat();
    } else {
      const month = m.getMonth();
      const short = m.getShortFormat();
      if (month >= ORGANISATION_NUMBER_MINIMUM_MONTH) {
        full = LEGAL_PERSON_CENTURY_PREFIX + short;
      } else {
        full = getPossibleFullIdNumber(m);
      }
    }

    if (!isValidPerson(full, type)) {
      throw new IllegalIdNumberException(`Invalid organisation ID: ${text}`);
    }
    return new OrganisationId(full);
  }

  static from(personalId: PersonOfficialIdBase): OrganisationId {
    return personalId.toOrganisationId();
  }

  static format(text: string, format: PnrFormat): string {
    return OrganisationId.parseOrThrow(text).formatted(format);
  }

  static isValid(
    text: string | null | undefined,
    type: OrganisationNumberType = OrganisationNumberType.LEGAL_OR_PHYSICAL_PERSON,
  ): boolean {
    try {
      const m = createMatcher(text as string);
      if (m.noMatch()) return false;

      let full: string;
      if (m.hasCentury()) {
        full = m.getLongFormat();
      } else {
        const month = m.getMonth();
        if (month >= ORGANISATION_NUMBER_MINIMUM_MONTH) {
          full = LEGAL_PERSON_CENTURY_PREFIX + m.getShortFormat();
        } else {
          full = getPossibleFullIdNumber(m);
        }
      }
      return isValidPerson(full, type);
    } catch {
      return false;
    }
  }

  getOrganisationForm(): OrganisationFormEntry {
    if (!this.isLegalPerson()) return OrganisationForm.NONE;
    return OrganisationForm.fromOrganisationNumber(this._id);
  }

  getRegistrationDate(): LocalDate | undefined {
    return undefined;
  }

  getOrganisationType(): string | undefined {
    const form = this.getOrganisationForm();
    if (form === OrganisationForm.NONE) return undefined;
    return form.name;
  }

  formatted(format: PnrFormat): string {
    return formatOrgId(this._id, format);
  }

  longFormat(): string {
    return this.formatted(PnrFormat.LONG_FORMAT);
  }
  shortFormat(): string {
    return this.formatted(PnrFormat.SHORT_FORMAT);
  }
  longFormatWithSeparator(): string {
    return this.formatted(PnrFormat.LONG_FORMAT_WITH_STANDARD_SEPARATOR);
  }
  shortFormatWithSeparator(): string {
    return this.formatted(PnrFormat.SHORT_FORMAT_WITH_STANDARD_SEPARATOR);
  }

  getCountryCode(): string {
    return "SE";
  }
  getIdType(): string {
    return "ORGANISATION";
  }

  isLegalPerson(): boolean {
    return this._id.substring(0, 2) === LEGAL_PERSON_CENTURY_PREFIX;
  }
  isPhysicalPerson(): boolean {
    return !this.isLegalPerson();
  }

  toPersonOfficialId(): PersonOfficialIdBase {
    const lf = this.longFormat();
    const coordParsed = CoordinationId.parse(lf);
    if (coordParsed !== undefined) return coordParsed;
    const personalParsed = PersonalId.parse(lf);
    if (personalParsed !== undefined) return personalParsed;
    throw new IllegalIdNumberException(
      `Invalid person official ID: ${this.formatted(PnrFormat.LONG_FORMAT_WITH_SEPARATOR)}`,
    );
  }

  toOrganisationId(): OrganisationId {
    return OrganisationId.parseOrThrow(this.longFormat());
  }

  equals(other: unknown): boolean {
    if (!(other instanceof OrganisationId)) return false;
    return this.longFormat() === other.longFormat();
  }

  toString(): string {
    return this.longFormat();
  }
}
