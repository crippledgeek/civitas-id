import type { LocalDate } from "@civitas-id/core";
import type { OrganisationOfficialId } from "@civitas-id/core";
import { InvalidIdNumberError } from "../error/invalid-id-number-error.js";
import { OrganisationForm } from "../format/organisation-form.js";
import type { OrganisationFormEntry } from "../format/organisation-form.js";
import { OrganisationNumberType } from "../format/organisation-number-type.js";
import { PnrFormat } from "../format/pnr-format.js";
import { SwedishLuhnAlgorithm } from "../validation/swedish-luhn-algorithm.js";
import { CoordinationId } from "./coordination-id.js";
import type { PersonOfficialIdBase } from "./coordination-id.js";
import {
  getPossibleFullIdNumber,
  isCoordinationNumberFull,
  isPersonalNumberFull,
} from "./person-official-id-base.js";
import { PersonalId } from "./personal-id.js";
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
    default: {
      const _: never = format;
      throw new Error(`Unhandled PnrFormat: ${_}`);
    }
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
    default: {
      const _: never = type;
      throw new Error(`Unhandled OrganisationNumberType: ${_}`);
    }
  }
}

/**
 * Represents a Swedish organisation number (organisationsnummer).
 *
 * An organisationsnummer identifies a legal or physical person in a commercial
 * or administrative context. This class accepts both 10-digit and 12-digit
 * (legacy `16`-prefix) input formats and normalises output to the official
 * 10-digit form. Legal persons have a month component >= 20; physical persons
 * reuse the personnummer or samordningsnummer format.
 */
export class OrganisationId implements OrganisationOfficialId<PnrFormat> {
  readonly type = "ORGANISATION" as const;

  private constructor(private readonly _id: string) {}

  /**
   * Parses `text` as an organisation number (legal or physical person),
   * returning `undefined` on failure.
   *
   * @param text - the ID string to parse (any supported format)
   * @returns an `OrganisationId` instance, or `undefined` if `text` is invalid
   */
  static parse(text: string | null | undefined): OrganisationId | undefined {
    return OrganisationId.parseWithType(text, OrganisationNumberType.LEGAL_OR_PHYSICAL_PERSON);
  }

  /**
   * Parses `text` as an organisation number restricted to `type`,
   * returning `undefined` on failure.
   *
   * @param text - the ID string to parse (any supported format)
   * @param type - the accepted person categories
   * @returns an `OrganisationId` instance, or `undefined` if `text` is invalid for `type`
   */
  static parseWithType(
    text: string | null | undefined,
    type: OrganisationNumberType,
  ): OrganisationId | undefined {
    if (text == null) return undefined;
    try {
      return OrganisationId.parseOrThrow(text, type);
    } catch (e) {
      if (e instanceof InvalidIdNumberError) return undefined;
      throw e;
    }
  }

  /**
   * Parses `text` as an organisation number, throwing on failure.
   *
   * @param text - the ID string to parse (any supported format)
   * @param type - the accepted person categories; defaults to `LEGAL_OR_PHYSICAL_PERSON`
   * @returns a valid `OrganisationId` instance
   * @throws {InvalidIdNumberError} if `text` is not a valid organisation number for `type`
   */
  static parseOrThrow(
    text: string,
    type: OrganisationNumberType = OrganisationNumberType.LEGAL_OR_PHYSICAL_PERSON,
  ): OrganisationId {
    const m = createMatcher(text);
    if (m.noMatch()) throw new InvalidIdNumberError(`Invalid organisation ID: ${text}`);

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
      throw new InvalidIdNumberError(`Invalid organisation ID: ${text}`);
    }
    return new OrganisationId(full);
  }

  /**
   * Constructs an `OrganisationId` from an existing {@link PersonOfficialIdBase} instance.
   *
   * @param personalId - a {@link PersonalId} or {@link CoordinationId} to convert
   * @returns the equivalent `OrganisationId`
   */
  static from(personalId: PersonOfficialIdBase): OrganisationId {
    return personalId.toOrganisationId();
  }

  /**
   * Parses `text` and returns it formatted according to `format`.
   *
   * @param text - the ID string to parse (any supported format)
   * @param format - the desired output format
   * @returns the formatted ID string
   * @throws {InvalidIdNumberError} if `text` is not a valid organisation number
   */
  static format(text: string, format: PnrFormat): string {
    return OrganisationId.parseOrThrow(text).formatted(format);
  }

  /**
   * Returns `true` if `text` is a syntactically and semantically valid organisation number
   * for the given `type`.
   *
   * @param text - the ID string to validate
   * @param type - the accepted person categories; defaults to `LEGAL_OR_PHYSICAL_PERSON`
   * @returns `true` when valid
   */
  static isValid(
    text: string | null | undefined,
    type: OrganisationNumberType = OrganisationNumberType.LEGAL_OR_PHYSICAL_PERSON,
  ): boolean {
    if (text == null) return false;
    try {
      const m = createMatcher(text);
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
    } catch (e) {
      if (e instanceof InvalidIdNumberError) return false;
      throw e;
    }
  }

  /**
   * Returns the {@link OrganisationFormEntry} for this organisation number,
   * or `OrganisationForm.NONE` if this ID represents a physical person.
   *
   * @returns the organisation form entry
   */
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

  /**
   * Converts this organisation ID to a {@link PersonOfficialIdBase} representation.
   *
   * Tries {@link CoordinationId} first, then {@link PersonalId}.
   *
   * @returns the equivalent `PersonalId` or `CoordinationId`
   * @throws {InvalidIdNumberError} if the underlying number cannot be parsed as a person ID
   */
  toPersonOfficialId(): PersonOfficialIdBase {
    const lf = this.longFormat();
    const coordParsed = CoordinationId.parse(lf);
    if (coordParsed !== undefined) return coordParsed;
    const personalParsed = PersonalId.parse(lf);
    if (personalParsed !== undefined) return personalParsed;
    throw new InvalidIdNumberError(
      `Invalid person official ID: ${this.formatted(PnrFormat.LONG_FORMAT_WITH_SEPARATOR)}`,
    );
  }

  /**
   * Re-parses this organisation number and returns a new `OrganisationId` instance.
   *
   * @returns a new `OrganisationId` parsed from the long format
   */
  toOrganisationId(): OrganisationId {
    return OrganisationId.parseOrThrow(this.longFormat());
  }

  /**
   * Returns `true` if `other` is an `OrganisationId` with the same long-format string.
   *
   * @param other - value to compare
   * @returns `true` when both instances represent the same organisation number
   */
  equals(other: unknown): boolean {
    if (!(other instanceof OrganisationId)) return false;
    return this.longFormat() === other.longFormat();
  }

  /**
   * Returns the long-format string representation of this organisation number.
   *
   * @returns the 10-digit ID string without separator
   */
  toString(): string {
    return this.longFormat();
  }
}
