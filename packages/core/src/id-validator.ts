import type { OfficialId } from "./official-id.js";
import type { ValidationResult } from "./validation-result.js";

/**
 * Contract for validators that parse and validate official ID numbers.
 *
 * @typeParam T - the concrete {@link OfficialId} type this validator handles
 */
export interface IdValidator<T extends OfficialId<never>> {
  /**
   * Returns `true` if the given raw string is a syntactically and semantically valid ID.
   *
   * @param input - the raw ID string to check
   * @returns `true` if valid
   */
  isValid(input: string): boolean;

  /**
   * Returns `true` if the given parsed ID object is valid.
   *
   * @param id - the parsed ID to check
   * @returns `true` if valid
   */
  isValid(id: T): boolean;

  /**
   * Parses and validates the given raw string, returning a detailed {@link ValidationResult}.
   *
   * @param input - the raw ID string to validate
   * @returns a {@link ValidationResult} describing whether the input is valid and, if not, why
   */
  validate(input: string): ValidationResult;
}
