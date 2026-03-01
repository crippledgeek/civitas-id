import type { LocalDate } from "./local-date.js";
import type { OfficialId } from "./official-id.js";

/**
 * Interface for official identification numbers that represent an organisation.
 *
 * Extends {@link OfficialId} with legal-person classification and registration metadata.
 *
 * @typeParam F - the format discriminator type for this ID
 */
export interface OrganisationOfficialId<F extends string = string> extends OfficialId<F> {
  /**
   * Returns `true` if this organisation is a legal person (juridisk person).
   *
   * @returns `true` for legal persons, `false` for sole traders registered as physical persons
   */
  isLegalPerson(): boolean;

  /**
   * Returns `true` if this organisation is registered as a physical person (enskild firma).
   *
   * @returns `true` for physical persons, `false` for legal persons
   */
  isPhysicalPerson(): boolean;

  /**
   * Returns the organisation's registration date, if known.
   *
   * @returns the registration date as a {@link LocalDate}, or `undefined` if not available
   */
  getRegistrationDate(): LocalDate | undefined;

  /**
   * Returns a string describing the organisation type (e.g. `"AB"`, `"HB"`), if available.
   *
   * @returns the organisation type label, or `undefined` if not applicable
   */
  getOrganisationType(): string | undefined;
}
