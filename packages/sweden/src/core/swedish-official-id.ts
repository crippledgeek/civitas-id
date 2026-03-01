import { InvalidIdNumberError } from "../error/invalid-id-number-error.js";
import { OrganisationNumberType } from "../format/organisation-number-type.js";
import type { PnrFormat } from "../format/pnr-format.js";
import { CoordinationId } from "./coordination-id.js";
import { PersonOfficialIdBase } from "./coordination-id.js";
import { OrganisationId } from "./organisation-id.js";
import { PersonalId } from "./personal-id.js";

/**
 * Union of all three supported Swedish official ID types.
 *
 * Use the companion `SwedishOfficialId` object for validation, parsing, and
 * formatting when the exact subtype is not known in advance. Use the type
 * guard functions ({@link isPersonalId}, {@link isCoordinationId},
 * {@link isOrganisationId}, {@link isPersonOfficialId}) to narrow to a specific subtype.
 */
export type SwedishOfficialId = PersonalId | CoordinationId | OrganisationId;

/**
 * Companion object for the {@link SwedishOfficialId} union type.
 *
 * Provides utility methods that accept any supported Swedish ID format
 * (personnummer, samordningsnummer, or organisationsnummer) without requiring
 * the caller to know the subtype in advance.
 */
export const SwedishOfficialId = {
  /**
   * Returns `true` if `text` is a valid personnummer, samordningsnummer, or
   * legal-person organisationsnummer.
   *
   * @param text - the ID string to validate
   * @returns `true` when valid
   */
  isValid(text: string | null | undefined): boolean {
    return (
      PersonOfficialIdBase.isValid(text) ||
      OrganisationId.isValid(text, OrganisationNumberType.LEGAL_PERSON)
    );
  },

  /**
   * Attempts to parse `text` as any Swedish official ID, returning `undefined` on failure.
   *
   * Resolution order: {@link PersonalId} → {@link CoordinationId} → {@link OrganisationId}.
   *
   * @param text - the ID string to parse (any supported format)
   * @returns a `SwedishOfficialId` instance, or `undefined` if `text` is invalid
   */
  parseAny(text: string | null | undefined): SwedishOfficialId | undefined {
    const personal = PersonalId.parse(text);
    if (personal !== undefined) return personal;
    const coord = CoordinationId.parse(text);
    if (coord !== undefined) return coord;
    return OrganisationId.parse(text);
  },

  /**
   * Parses `text` as any Swedish official ID, throwing on failure.
   *
   * @param text - the ID string to parse (any supported format)
   * @returns a valid `SwedishOfficialId` instance
   * @throws {IllegalIdNumberException} if `text` is not a valid Swedish ID number
   */
  parseAnyOrThrow(text: string): SwedishOfficialId {
    const result = SwedishOfficialId.parseAny(text);
    if (result === undefined) throw new InvalidIdNumberError(`Invalid Swedish ID number: ${text}`);
    return result;
  },

  /**
   * Parses `text` and returns it formatted according to `format`.
   *
   * Person IDs are tried before legal-person organisation IDs.
   *
   * @param text - the ID string to parse (any supported format)
   * @param format - the desired output format
   * @returns the formatted ID string
   * @throws {IllegalIdNumberException} if `text` is not a valid Swedish ID number
   */
  format(text: string, format: PnrFormat): string {
    if (PersonOfficialIdBase.isValid(text)) return PersonOfficialIdBase.format(text, format);
    if (OrganisationId.isValid(text, OrganisationNumberType.LEGAL_PERSON)) {
      return OrganisationId.parseOrThrow(text, OrganisationNumberType.LEGAL_PERSON).formatted(
        format,
      );
    }
    throw new InvalidIdNumberError(`Invalid Swedish ID number: ${text}`);
  },
};

/**
 * Type guard that narrows a {@link SwedishOfficialId} to {@link PersonalId}.
 *
 * @param id - the ID to test
 * @returns `true` if `id` is a `PersonalId`
 */
export function isPersonalId(id: SwedishOfficialId): id is PersonalId {
  return id instanceof PersonalId;
}

/**
 * Type guard that narrows a {@link SwedishOfficialId} to {@link CoordinationId}.
 *
 * @param id - the ID to test
 * @returns `true` if `id` is a `CoordinationId`
 */
export function isCoordinationId(id: SwedishOfficialId): id is CoordinationId {
  return id instanceof CoordinationId;
}

/**
 * Type guard that narrows a {@link SwedishOfficialId} to {@link OrganisationId}.
 *
 * @param id - the ID to test
 * @returns `true` if `id` is an `OrganisationId`
 */
export function isOrganisationId(id: SwedishOfficialId): id is OrganisationId {
  return id instanceof OrganisationId;
}

/**
 * Type guard that narrows a {@link SwedishOfficialId} to {@link PersonOfficialIdBase}
 * (i.e. either {@link PersonalId} or {@link CoordinationId}).
 *
 * @param id - the ID to test
 * @returns `true` if `id` is a `PersonalId` or `CoordinationId`
 */
export function isPersonOfficialId(id: SwedishOfficialId): id is PersonOfficialIdBase {
  return id instanceof PersonalId || id instanceof CoordinationId;
}
