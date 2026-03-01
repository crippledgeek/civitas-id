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
   * Returns the long string representation without a separator.
   *
   * The length is subtype-dependent (e.g. 12 digits for person IDs, 10 for organisation IDs).
   *
   * @returns the full-length ID string, e.g. `"199001011234"` or `"5560123456"`
   */
  longFormat(): string;

  /**
   * Returns the short string representation without a separator.
   *
   * The length is subtype-dependent (e.g. 10 digits for person IDs, 10 for organisation IDs).
   *
   * @returns the abbreviated ID string, e.g. `"9001011234"` or `"5560123456"`
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
   * Returns the long representation including the separator character.
   *
   * The length is subtype-dependent (e.g. 13 chars for person IDs, 11 for organisation IDs).
   *
   * @returns the full-length ID string with separator, e.g. `"19900101-1234"` or `"556012-3456"`
   */
  longFormatWithSeparator(): string;

  /**
   * Returns the short representation including the separator character.
   *
   * The length is subtype-dependent (e.g. 11 chars for person IDs, 11 for organisation IDs).
   *
   * @returns the abbreviated ID string with separator, e.g. `"900101-1234"` or `"556012-3456"`
   */
  shortFormatWithSeparator(): string;

  /**
   * Returns the ISO 3166-1 alpha-2 country code this ID belongs to.
   *
   * @returns a two-letter country code, e.g. `"SE"`
   */
  getCountryCode(): string;

  /**
   * Returns a string identifying the type of this ID (e.g. `"PERSONAL"`, `"COORDINATION"`, `"ORGANISATION"`).
   *
   * @returns the ID type identifier
   */
  getIdType(): string;
}
