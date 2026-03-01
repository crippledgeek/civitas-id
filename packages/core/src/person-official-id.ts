import type { LocalDate } from "./local-date.js";
import type { OfficialId } from "./official-id.js";

/**
 * Interface for official identification numbers that represent a natural person.
 *
 * Extends {@link OfficialId} with birth date, age, and gender accessors.
 *
 * @typeParam F - the format discriminator type for this ID
 */
export interface PersonOfficialId<F extends string = string> extends OfficialId<F> {
  /**
   * Returns the holder's date of birth.
   *
   * @returns the birth date as a {@link LocalDate}
   */
  getBirthDate(): LocalDate;

  /**
   * Returns the holder's age in whole years relative to the given reference date.
   *
   * @param clock - optional function returning the reference date; defaults to today
   * @returns age in whole years
   */
  getAge(clock?: () => LocalDate): number;

  /**
   * Returns `true` if the holder is male according to the ID number encoding.
   *
   * @returns `true` for male, `false` otherwise
   */
  isMale(): boolean;

  /**
   * Returns `true` if the holder is female according to the ID number encoding.
   *
   * @returns `true` for female, `false` otherwise
   */
  isFemale(): boolean;

  /**
   * Returns `true` if the holder is 18 years of age or older at the reference date.
   *
   * @param clock - optional function returning the reference date; defaults to today
   * @returns `true` if the person is an adult
   */
  isAdult(clock?: () => LocalDate): boolean;

  /**
   * Returns `true` if the holder is under 18 years of age at the reference date.
   *
   * @param clock - optional function returning the reference date; defaults to today
   * @returns `true` if the person is a child
   */
  isChild(clock?: () => LocalDate): boolean;
}
