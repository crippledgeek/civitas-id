import { LocalDate } from "@civitas-id/core";
import type { PersonOfficialId as IPersonOfficialId } from "@civitas-id/core";
import { PnrFormat } from "../format/pnr-format.js";
import { formatPersonId, getGenderDigit } from "./person-official-id-base.js";
import { LEGAL_PERSON_CENTURY_PREFIX } from "./swedish-id-matcher.js";

/**
 * Shared base implementation for {@link PersonalId} and {@link CoordinationId}.
 *
 * Holds the canonical 13-character internal representation (`YYYYMMDD-XXXX` or
 * `YYYYMMDD+XXXX`) and provides concrete implementations of all
 * {@link IPersonOfficialId} methods. Subclasses must supply `getBirthDate()`
 * and `getIdType()`, since the day component interpretation differs between
 * personal and coordination IDs.
 */
export abstract class AbstractPersonId implements IPersonOfficialId<PnrFormat> {
  /** Discriminant string identifying the concrete subclass type. */
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

  /**
   * Returns `true` if the ID was issued for a legal person (i.e. the century
   * prefix is `"16"`, indicating an organisation masquerading as a person ID).
   *
   * @returns `true` for legal persons
   */
  isLegalPerson(): boolean {
    return this._id.substring(0, 2) === LEGAL_PERSON_CENTURY_PREFIX;
  }

  /**
   * Returns `true` if the ID was issued for a physical (natural) person.
   *
   * @returns `true` for physical persons
   */
  isPhysicalPerson(): boolean {
    return !this.isLegalPerson();
  }

  /**
   * Returns `this`, satisfying the {@link IPersonOfficialId} contract.
   *
   * @returns the same instance
   */
  toPersonOfficialId(): this {
    return this;
  }

  /**
   * Returns `true` if `other` is an instance of the same concrete subclass
   * representing the same ID number in long format.
   *
   * @param other - value to compare
   * @returns `true` when both instances are equal
   */
  equals(other: unknown): boolean {
    if (!(other instanceof AbstractPersonId)) return false;
    if (this.constructor !== other.constructor) return false;
    return this.longFormat() === other.longFormat();
  }

  /**
   * Returns the long-format string representation of this ID.
   *
   * @returns the 12-digit ID string without separator
   */
  toString(): string {
    return this.longFormat();
  }
}
