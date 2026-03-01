import { LocalDate } from "@civitas-id/core";
import type { PersonOfficialId as IPersonOfficialId } from "@civitas-id/core";
import { IllegalIdNumberException } from "../error/illegal-id-number-exception.js";
import { PnrFormat } from "../format/pnr-format.js";
import { ChecksumValidator } from "./checksum-validator.js";
import type { PersonOfficialIdBase } from "./coordination-id.js";
import { OrganisationId } from "./organisation-id.js";
import {
  formatPersonId,
  getGenderDigit,
  getPossibleFullIdNumber,
  isValidPersonDate,
} from "./person-official-id-base.js";
import { LEGAL_PERSON_CENTURY_PREFIX, createMatcher } from "./swedish-id-matcher.js";

export function isPersonalNumberFull(fullPersonalNumber: string): boolean {
  if (!isValidPersonDate(fullPersonalNumber)) return false;
  const tenDigits = fullPersonalNumber.substring(2, 8) + fullPersonalNumber.substring(9);
  return ChecksumValidator.isChecksumValid(tenDigits);
}

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
