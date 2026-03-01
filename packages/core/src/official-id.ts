export interface OfficialId<F extends string = string> {
  longFormat(): string;
  shortFormat(): string;
  formatted(format: F): string;
  longFormatWithSeparator(): string;
  shortFormatWithSeparator(): string;
  getCountryCode(): string;
  getIdType(): string;
}
