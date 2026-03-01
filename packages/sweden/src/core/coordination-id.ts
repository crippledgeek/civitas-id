import { LocalDate } from "@civitas-id/core";
import type { PersonOfficialId as IPersonOfficialId } from "@civitas-id/core";
import { IllegalIdNumberException } from "../error/illegal-id-number-exception.js";
import { PnrFormat } from "../format/pnr-format.js";
import { ChecksumValidator } from "./checksum-validator.js";
import { OrganisationId } from "./organisation-id.js";
import {
  formatPersonId,
  getGenderDigit,
  getPossibleFullIdNumber,
  isValidCoordinationDate,
} from "./person-official-id-base.js";
import { PersonalId } from "./personal-id.js";
import { LEGAL_PERSON_CENTURY_PREFIX, createMatcher } from "./swedish-id-matcher.js";

export function isCoordinationNumberFull(fullCoordinationNumber: string): boolean {
  if (!isValidCoordinationDate(fullCoordinationNumber)) return false;
  const tenDigits = fullCoordinationNumber.substring(2, 8) + fullCoordinationNumber.substring(9);
  return ChecksumValidator.isChecksumValid(tenDigits);
}

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
