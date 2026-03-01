/**
 * Base interface for all official identification numbers.
 *
 * Provides format-agnostic access to the string representation and metadata
 * of a parsed, valid ID number.
 *
 * @typeParam F - the format discriminator type for this ID (e.g. a `PnrFormat` string union)
 */
export interface OfficialId<F extends string = string> {
  /**
   * Returns the long (12-digit) string representation without a separator.
   *
   * @returns the full-length ID string, e.g. `"199001011234"`
   */
  longFormat(): string;

  /**
   * Returns the short (10-digit) string representation without a separator.
   *
   * @returns the abbreviated ID string, e.g. `"9001011234"`
   */
  shortFormat(): string;

  /**
   * Returns the ID formatted according to the given format discriminator.
   *
   * @param format - the desired output format
   * @returns the formatted ID string
   */
  formatted(format: F): string;

  /**
   * Returns the long (12-digit) representation including the separator character.
   *
   * @returns the full-length ID string with separator, e.g. `"19900101-1234"`
   */
  longFormatWithSeparator(): string;

  /**
   * Returns the short (10-digit) representation including the separator character.
   *
   * @returns the abbreviated ID string with separator, e.g. `"900101-1234"`
   */
  shortFormatWithSeparator(): string;

  /**
   * Returns the ISO 3166-1 alpha-2 country code this ID belongs to.
   *
   * @returns a two-letter country code, e.g. `"SE"`
   */
  getCountryCode(): string;

  /**
   * Returns a string identifying the type of this ID (e.g. `"PNR"`, `"ORG"`).
   *
   * @returns the ID type identifier
   */
  getIdType(): string;
}
