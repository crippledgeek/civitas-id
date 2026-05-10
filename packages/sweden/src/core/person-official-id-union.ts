import { InvalidIdNumberError } from "../error/invalid-id-number-error.js";
import type { PnrFormat } from "../format/pnr-format.js";
import { CoordinationId } from "./coordination-id.js";
import { PersonalId } from "./personal-id.js";

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
   * @throws {InvalidIdNumberError} if `text` is neither a valid personnummer nor a samordningsnummer
   */
  format(text: string, format: PnrFormat): string {
    // Order is irrelevant for correctness — coordination IDs encode day-offset 60
    // (days 61-91), which fail PersonalId date validation, and personnummer with
    // days 1-31 fail CoordinationId's day-offset check. We try Coordination first
    // here for historic reasons; either order produces identical results for
    // valid input.
    if (CoordinationId.isValid(text)) return CoordinationId.parseOrThrow(text).formatted(format);
    if (PersonalId.isValid(text)) return PersonalId.parseOrThrow(text).formatted(format);
    throw new InvalidIdNumberError(
      "Invalid person official ID: input is neither a valid personnummer nor samordningsnummer",
    );
  },
};
