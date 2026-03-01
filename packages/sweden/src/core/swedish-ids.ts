/**
 * Swedish ID classes: PersonalId, CoordinationId, OrganisationId
 * All defined in a single module to avoid circular dependency issues.
 */

import { LocalDate } from "@civitas-id/core";
import type {
  PersonOfficialId as IPersonOfficialId,
  OrganisationOfficialId,
} from "@civitas-id/core";
import { IllegalIdNumberException } from "../error/illegal-id-number-exception.js";
import { OrganisationForm } from "../format/organisation-form.js";
import type { OrganisationFormEntry } from "../format/organisation-form.js";
import { OrganisationNumberType } from "../format/organisation-number-type.js";
import { PnrFormat } from "../format/pnr-format.js";
import { ChecksumValidator } from "./checksum-validator.js";
import {
  formatPersonId,
  getGenderDigit,
  getPossibleFullIdNumber,
  isValidCoordinationDate,
  isValidPersonDate,
} from "./person-official-id-base.js";
import { LEGAL_PERSON_CENTURY_PREFIX, createMatcher } from "./swedish-id-matcher.js";

// ===== Shared formatting for organisation IDs =====

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

// ===== Checksum helpers =====

function isPersonalNumberFull(fullPersonalNumber: string): boolean {
  if (!isValidPersonDate(fullPersonalNumber)) return false;
  const tenDigits = fullPersonalNumber.substring(2, 8) + fullPersonalNumber.substring(9);
  return ChecksumValidator.isChecksumValid(tenDigits);
}

function isCoordinationNumberFull(fullCoordinationNumber: string): boolean {
  if (!isValidCoordinationDate(fullCoordinationNumber)) return false;
  const tenDigits = fullCoordinationNumber.substring(2, 8) + fullCoordinationNumber.substring(9);
  return ChecksumValidator.isChecksumValid(tenDigits);
}

// ===== PersonalId =====

/**
 * Represents a Swedish personal identification number (personnummer).
 */
export class PersonalId implements IPersonOfficialId<PnrFormat> {
  readonly type = "PERSONAL" as const;

  private constructor(private readonly _id: string) {}

  static parse(text: string | null | undefined): PersonalId | undefined {
    try {
      return PersonalId.parseOrThrow(text as string);
    } catch {
      return undefined;
    }
  }

  static parseOrThrow(text: string): PersonalId {
    const m = createMatcher(text);
    if (m.noMatch()) throw new IllegalIdNumberException(`Invalid personal ID: ${text}`);

    const full = m.hasCentury() ? m.getLongFormat() : getPossibleFullIdNumber(m);
    if (!isPersonalNumberFull(full))
      throw new IllegalIdNumberException(`Invalid personal ID: ${text}`);
    return new PersonalId(full);
  }

  static format(text: string, format: PnrFormat): string {
    return PersonalId.parseOrThrow(text).formatted(format);
  }

  static isValid(text: string | null | undefined): boolean {
    try {
      const m = createMatcher(text as string);
      if (m.noMatch()) return false;
      const full = m.hasCentury() ? m.getLongFormat() : getPossibleFullIdNumber(m);
      return isPersonalNumberFull(full);
    } catch {
      return false;
    }
  }

  getBirthDate(): LocalDate {
    const s = this.longFormat();
    return LocalDate.of(
      Number.parseInt(s.substring(0, 4), 10),
      Number.parseInt(s.substring(4, 6), 10),
      Number.parseInt(s.substring(6, 8), 10),
    );
  }

  getAge(clock?: () => LocalDate): number {
    const now = clock ? clock() : LocalDate.now();
    return this.getBirthDate().age(now);
  }

  isFemale(): boolean {
    return getGenderDigit(this._id) % 2 === 0;
  }
  isMale(): boolean {
    return !this.isFemale();
  }
  isAdult(clock?: () => LocalDate): boolean {
    return this.getAge(clock) >= 18;
  }
  isChild(clock?: () => LocalDate): boolean {
    const a = this.getAge(clock);
    return a >= 0 && a < 18;
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
  formatted(format: PnrFormat): string {
    return formatPersonId(this._id, format);
  }
  getCountryCode(): string {
    return "SE";
  }
  getIdType(): string {
    return "PERSONAL";
  }

  isLegalPerson(): boolean {
    return this._id.substring(0, 2) === LEGAL_PERSON_CENTURY_PREFIX;
  }
  isPhysicalPerson(): boolean {
    return !this.isLegalPerson();
  }

  toOrganisationId(): OrganisationId {
    return OrganisationId.parseOrThrow(this._id);
  }

  toPersonOfficialId(): PersonOfficialIdBase {
    return this;
  }

  equals(other: unknown): boolean {
    if (!(other instanceof PersonalId)) return false;
    return this.longFormat() === other.longFormat();
  }

  toString(): string {
    return this.longFormat();
  }
}

// ===== CoordinationId =====

/**
 * Represents a Swedish coordination ID (samordningsnummer).
 * The day component is increased by 60 to distinguish from personal IDs.
 */
export class CoordinationId implements IPersonOfficialId<PnrFormat> {
  readonly type = "COORDINATION" as const;

  private constructor(private readonly _id: string) {}

  static parse(text: string | null | undefined): CoordinationId | undefined {
    try {
      return CoordinationId.parseOrThrow(text as string);
    } catch {
      return undefined;
    }
  }

  static parseOrThrow(text: string): CoordinationId {
    const m = createMatcher(text);
    if (m.noMatch()) throw new IllegalIdNumberException(`Invalid coordination ID: ${text}`);

    const full = m.hasCentury() ? m.getLongFormat() : getPossibleFullIdNumber(m);
    if (!isCoordinationNumberFull(full))
      throw new IllegalIdNumberException(`Invalid coordination ID: ${text}`);
    return new CoordinationId(full);
  }

  static format(text: string, format: PnrFormat): string {
    return CoordinationId.parseOrThrow(text).formatted(format);
  }

  static isValid(text: string | null | undefined): boolean {
    try {
      const m = createMatcher(text as string);
      if (m.noMatch()) return false;
      const full = m.hasCentury() ? m.getLongFormat() : getPossibleFullIdNumber(m);
      return isCoordinationNumberFull(full);
    } catch {
      return false;
    }
  }

  getBirthDate(): LocalDate {
    const s = this.longFormat();
    const coordDay = Number.parseInt(s.substring(6, 8), 10);
    const actualDay = coordDay - 60;
    return LocalDate.of(
      Number.parseInt(s.substring(0, 4), 10),
      Number.parseInt(s.substring(4, 6), 10),
      actualDay,
    );
  }

  getAge(clock?: () => LocalDate): number {
    const now = clock ? clock() : LocalDate.now();
    return this.getBirthDate().age(now);
  }

  isFemale(): boolean {
    return getGenderDigit(this._id) % 2 === 0;
  }
  isMale(): boolean {
    return !this.isFemale();
  }
  isAdult(clock?: () => LocalDate): boolean {
    return this.getAge(clock) >= 18;
  }
  isChild(clock?: () => LocalDate): boolean {
    const a = this.getAge(clock);
    return a >= 0 && a < 18;
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
  formatted(format: PnrFormat): string {
    return formatPersonId(this._id, format);
  }
  getCountryCode(): string {
    return "SE";
  }
  getIdType(): string {
    return "COORDINATION";
  }

  isLegalPerson(): boolean {
    return this._id.substring(0, 2) === LEGAL_PERSON_CENTURY_PREFIX;
  }
  isPhysicalPerson(): boolean {
    return !this.isLegalPerson();
  }

  toOrganisationId(): OrganisationId {
    return OrganisationId.parseOrThrow(this._id);
  }

  toPersonOfficialId(): PersonOfficialIdBase {
    return this;
  }

  equals(other: unknown): boolean {
    if (!(other instanceof CoordinationId)) return false;
    return this.longFormat() === other.longFormat();
  }

  toString(): string {
    return this.longFormat();
  }
}

/**
 * Union type for person official IDs (PersonalId | CoordinationId).
 */
export type PersonOfficialIdBase = PersonalId | CoordinationId;

export const PersonOfficialIdBase = {
  isValid(text: string | null | undefined): boolean {
    return PersonalId.isValid(text) || CoordinationId.isValid(text);
  },

  format(text: string, format: PnrFormat): string {
    if (CoordinationId.isValid(text)) return CoordinationId.parseOrThrow(text).formatted(format);
    if (PersonalId.isValid(text)) return PersonalId.parseOrThrow(text).formatted(format);
    throw new IllegalIdNumberException(`Invalid person official ID: ${text}`);
  },
};

// ===== OrganisationId =====

const ORGANISATION_NUMBER_MINIMUM_MONTH = 20;

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

// ===== Validation helpers for OrganisationId =====

function isOrganisationNumber(full: string): boolean {
  const separator = full.charAt(8);
  if (separator !== "-" && separator !== "+") return false;
  if (full.substring(0, 2) !== LEGAL_PERSON_CENTURY_PREFIX) return false;
  const month = Number.parseInt(full.substring(4, 6), 10);
  if (month < ORGANISATION_NUMBER_MINIMUM_MONTH) return false;
  const tenDigits = full.substring(2, 8) + full.substring(9);
  return ChecksumValidator.isChecksumValid(tenDigits);
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

// ===== SwedishOfficialId union =====

export type SwedishOfficialId = PersonalId | CoordinationId | OrganisationId;

export const SwedishOfficialId = {
  isValid(text: string | null | undefined): boolean {
    return (
      PersonOfficialIdBase.isValid(text) ||
      OrganisationId.isValid(text as string, OrganisationNumberType.LEGAL_PERSON)
    );
  },

  parseAny(text: string | null | undefined): SwedishOfficialId | undefined {
    const personal = PersonalId.parse(text as string);
    if (personal !== undefined) return personal;
    const coord = CoordinationId.parse(text as string);
    if (coord !== undefined) return coord;
    return OrganisationId.parse(text as string);
  },

  parseAnyOrThrow(text: string): SwedishOfficialId {
    const result = SwedishOfficialId.parseAny(text);
    if (result === undefined)
      throw new IllegalIdNumberException(`Invalid Swedish ID number: ${text}`);
    return result;
  },

  format(text: string, format: PnrFormat): string {
    if (PersonOfficialIdBase.isValid(text)) return PersonOfficialIdBase.format(text, format);
    if (OrganisationId.isValid(text, OrganisationNumberType.LEGAL_PERSON)) {
      return OrganisationId.parseOrThrow(text, OrganisationNumberType.LEGAL_PERSON).formatted(
        format,
      );
    }
    throw new IllegalIdNumberException(`Invalid Swedish ID number: ${text}`);
  },
};

// ===== Type guards =====

export function isPersonalId(id: SwedishOfficialId): id is PersonalId {
  return id instanceof PersonalId;
}

export function isCoordinationId(id: SwedishOfficialId): id is CoordinationId {
  return id instanceof CoordinationId;
}

export function isOrganisationId(id: SwedishOfficialId): id is OrganisationId {
  return id instanceof OrganisationId;
}

export function isPersonOfficialId(id: SwedishOfficialId): id is PersonOfficialIdBase {
  return id instanceof PersonalId || id instanceof CoordinationId;
}
