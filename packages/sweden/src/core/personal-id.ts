import { LocalDate } from "@civitas-id/core";
import { InvalidIdNumberError } from "../error/invalid-id-number-error.js";
import type { PnrFormat } from "../format/pnr-format.js";
import { AbstractPersonId } from "./abstract-person-id.js";
import { OrganisationId } from "./organisation-id.js";
import { getPossibleFullIdNumber, isPersonalNumberFull } from "./person-official-id-base.js";
import { createMatcher } from "./swedish-id-matcher.js";

/**
 * Represents a Swedish personal identification number (personnummer).
 *
 * A personnummer uniquely identifies a natural person in Sweden and consists of
 * a birth date, a 3-digit serial number, and a Luhn checksum digit. The day
 * component is the actual calendar day (contrast with {@link CoordinationId},
 * where it is offset by 60).
 */
export class PersonalId extends AbstractPersonId {
  readonly type = "PERSONAL" as const;

  private constructor(id: string) {
    super(id);
  }

  /**
   * Parses `text` as a personnummer, returning `undefined` on failure.
   *
   * @param text - the ID string to parse (any supported format)
   * @returns a `PersonalId` instance, or `undefined` if `text` is invalid
   */
  static parse(text: string | null | undefined): PersonalId | undefined {
    if (text == null) return undefined;
    try {
      return PersonalId.parseOrThrow(text);
    } catch (e) {
      if (e instanceof InvalidIdNumberError) return undefined;
      throw e;
    }
  }

  /**
   * Parses `text` as a personnummer, throwing on failure.
   *
   * @param text - the ID string to parse (any supported format)
   * @returns a valid `PersonalId` instance
   * @throws {IllegalIdNumberException} if `text` is not a valid personnummer
   */
  static parseOrThrow(text: string): PersonalId {
    const m = createMatcher(text);
    if (m.noMatch()) throw new InvalidIdNumberError(`Invalid personal ID: ${text}`);

    const full = m.hasCentury() ? m.getLongFormat() : getPossibleFullIdNumber(m);
    if (!isPersonalNumberFull(full)) throw new InvalidIdNumberError(`Invalid personal ID: ${text}`);
    return new PersonalId(full);
  }

  /**
   * Parses `text` and returns it formatted according to `format`.
   *
   * @param text - the ID string to parse (any supported format)
   * @param format - the desired output format
   * @returns the formatted ID string
   * @throws {IllegalIdNumberException} if `text` is not a valid personnummer
   */
  static format(text: string, format: PnrFormat): string {
    return PersonalId.parseOrThrow(text).formatted(format);
  }

  /**
   * Returns `true` if `text` is a syntactically and semantically valid personnummer.
   *
   * @param text - the ID string to validate
   * @returns `true` when valid
   */
  static isValid(text: string | null | undefined): boolean {
    if (text == null) return false;
    try {
      const m = createMatcher(text);
      if (m.noMatch()) return false;
      const full = m.hasCentury() ? m.getLongFormat() : getPossibleFullIdNumber(m);
      return isPersonalNumberFull(full);
    } catch (e) {
      if (e instanceof InvalidIdNumberError) return false;
      throw e;
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

  getIdType(): string {
    return "PERSONAL";
  }

  /**
   * Converts this personnummer to an {@link OrganisationId} representation.
   *
   * @returns the equivalent `OrganisationId`
   * @throws {IllegalIdNumberException} if the underlying ID cannot be parsed as an organisation number
   */
  toOrganisationId(): OrganisationId {
    return OrganisationId.parseOrThrow(this._id);
  }
}
