import { LocalDate } from "@civitas-id/core";
import { IllegalIdNumberException } from "../error/illegal-id-number-exception.js";
import type { PnrFormat } from "../format/pnr-format.js";
import { AbstractPersonId } from "./abstract-person-id.js";
import { OrganisationId } from "./organisation-id.js";
import {
  getPossibleFullIdNumber,
  isIdNumberFull,
  isValidCoordinationDate,
} from "./person-official-id-base.js";
import { PersonalId } from "./personal-id.js";
import { createMatcher } from "./swedish-id-matcher.js";

/**
 * Returns `true` if `fullCoordinationNumber` is a syntactically valid 13-character
 * samordningsnummer in long internal format with a valid coordination date (day + 60)
 * and Luhn checksum.
 *
 * @param fullCoordinationNumber - the full-length ID string to validate
 * @returns `true` when valid
 */
export function isCoordinationNumberFull(fullCoordinationNumber: string): boolean {
  return isIdNumberFull(fullCoordinationNumber, isValidCoordinationDate);
}

/**
 * Represents a Swedish coordination ID (samordningsnummer).
 *
 * A samordningsnummer is assigned to persons who are not registered in the
 * Swedish population register but need a unique identifier. The day component
 * in the number is the actual birth day increased by 60 (e.g. day 15 is stored
 * as 75) to distinguish coordination IDs from {@link PersonalId} numbers.
 */
export class CoordinationId extends AbstractPersonId {
  readonly type = "COORDINATION" as const;

  private constructor(id: string) {
    super(id);
  }

  /**
   * Parses `text` as a samordningsnummer, returning `undefined` on failure.
   *
   * @param text - the ID string to parse (any supported format)
   * @returns a `CoordinationId` instance, or `undefined` if `text` is invalid
   */
  static parse(text: string | null | undefined): CoordinationId | undefined {
    try {
      return CoordinationId.parseOrThrow(text as string);
    } catch {
      return undefined;
    }
  }

  /**
   * Parses `text` as a samordningsnummer, throwing on failure.
   *
   * @param text - the ID string to parse (any supported format)
   * @returns a valid `CoordinationId` instance
   * @throws {IllegalIdNumberException} if `text` is not a valid samordningsnummer
   */
  static parseOrThrow(text: string): CoordinationId {
    const m = createMatcher(text);
    if (m.noMatch()) throw new IllegalIdNumberException(`Invalid coordination ID: ${text}`);

    const full = m.hasCentury() ? m.getLongFormat() : getPossibleFullIdNumber(m);
    if (!isCoordinationNumberFull(full))
      throw new IllegalIdNumberException(`Invalid coordination ID: ${text}`);
    return new CoordinationId(full);
  }

  /**
   * Parses `text` and returns it formatted according to `format`.
   *
   * @param text - the ID string to parse (any supported format)
   * @param format - the desired output format
   * @returns the formatted ID string
   * @throws {IllegalIdNumberException} if `text` is not a valid samordningsnummer
   */
  static format(text: string, format: PnrFormat): string {
    return CoordinationId.parseOrThrow(text).formatted(format);
  }

  /**
   * Returns `true` if `text` is a syntactically and semantically valid samordningsnummer.
   *
   * @param text - the ID string to validate
   * @returns `true` when valid
   */
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

  getIdType(): string {
    return "COORDINATION";
  }

  /**
   * Converts this coordination ID to an {@link OrganisationId} representation.
   *
   * @returns the equivalent `OrganisationId`
   * @throws {IllegalIdNumberException} if the underlying ID cannot be parsed as an organisation number
   */
  toOrganisationId(): OrganisationId {
    return OrganisationId.parseOrThrow(this._id);
  }
}

/**
 * Union of the two physical-person ID types: {@link PersonalId} and {@link CoordinationId}.
 *
 * Use the companion `PersonOfficialIdBase` object for validation and formatting
 * when the exact subtype is not yet known.
 */
export type PersonOfficialIdBase = PersonalId | CoordinationId;

/**
 * Companion object for the {@link PersonOfficialIdBase} union type.
 *
 * Provides utility methods that accept either a personnummer or a
 * samordningsnummer without requiring the caller to know which subtype is in use.
 */
export const PersonOfficialIdBase = {
  /**
   * Returns `true` if `text` is a valid personnummer or samordningsnummer.
   *
   * @param text - the ID string to validate
   * @returns `true` when valid
   */
  isValid(text: string | null | undefined): boolean {
    return PersonalId.isValid(text) || CoordinationId.isValid(text);
  },

  /**
   * Parses `text` and returns it formatted according to `format`.
   *
   * Coordination IDs are tried first; personnummer is tried second.
   *
   * @param text - the ID string to parse (any supported format)
   * @param format - the desired output format
   * @returns the formatted ID string
   * @throws {IllegalIdNumberException} if `text` is neither a valid personnummer nor a samordningsnummer
   */
  format(text: string, format: PnrFormat): string {
    if (CoordinationId.isValid(text)) return CoordinationId.parseOrThrow(text).formatted(format);
    if (PersonalId.isValid(text)) return PersonalId.parseOrThrow(text).formatted(format);
    throw new IllegalIdNumberException(`Invalid person official ID: ${text}`);
  },
};
