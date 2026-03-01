import type { LocalDate, OfficialId } from "@civitas-id/core";

/**
 * Base interface for creating fake/random official IDs for testing purposes.
 */
export interface IdFaker<T extends OfficialId<string>> {
  /** Creates a random valid ID with a random date within a reasonable range. */
  create(): T;

  /** Creates a valid ID for the specified date. */
  create(date: LocalDate): T;

  /** Convenience — equivalent to create(LocalDate.of(year, month, dayOfMonth)). */
  createFor(year: number, month: number, dayOfMonth: number): T;

  /** Returns the ISO 3166-1 alpha-2 country code this faker generates IDs for. */
  getCountryCode(): string;
}
