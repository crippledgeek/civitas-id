import { LocalDate } from "@civitas-id/core";
import type { PersonOfficialId as IPersonOfficialId } from "@civitas-id/core";
import { PnrFormat } from "../format/pnr-format.js";
import { formatPersonId, getGenderDigit } from "./person-official-id-base.js";
import { LEGAL_PERSON_CENTURY_PREFIX } from "./swedish-id-matcher.js";

/**
 * Shared implementation for PersonalId and CoordinationId.
 * Subclasses provide getBirthDate() and getIdType().
 */
export abstract class AbstractPersonId implements IPersonOfficialId<PnrFormat> {
  abstract readonly type: string;

  protected constructor(protected readonly _id: string) {}

  abstract getBirthDate(): LocalDate;
  abstract getIdType(): string;

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

  isLegalPerson(): boolean {
    return this._id.substring(0, 2) === LEGAL_PERSON_CENTURY_PREFIX;
  }
  isPhysicalPerson(): boolean {
    return !this.isLegalPerson();
  }

  toString(): string {
    return this.longFormat();
  }
}
