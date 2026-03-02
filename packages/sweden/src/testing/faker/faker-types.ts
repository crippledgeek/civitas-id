import type {
  LocalDate,
  OfficialId,
  OrganisationOfficialId,
  PersonOfficialId,
} from "@deathbycode/civitas-id-core";

/**
 * Base interface for creating fake/random official IDs for testing purposes.
 */
export interface IdFaker<T extends OfficialId> {
  /** Creates a random valid ID with a random date within a reasonable range. */
  create(): T;

  /**
   * Creates a valid ID for the specified date.
   * @throws {InvalidIdNumberError} if the supplied date is invalid
   */
  create(date: LocalDate): T;

  /**
   * Convenience — equivalent to create(LocalDate.of(year, month, dayOfMonth)).
   * @throws {InvalidIdNumberError} if the supplied date is invalid
   */
  createFor(year: number, month: number, dayOfMonth: number): T;

  /** Returns the ISO 3166-1 alpha-2 country code this faker generates IDs for. */
  getCountryCode(): string;
}

/**
 * Faker type for person identification numbers.
 */
export type PersonIdFaker<T extends PersonOfficialId> = IdFaker<T>;

/**
 * Faker type for organisation identification numbers.
 */
export type OrganisationIdFaker<T extends OrganisationOfficialId> = IdFaker<T>;
