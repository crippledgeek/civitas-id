import type { IdFormat } from "./id-format.js";

export interface OfficialId<F extends IdFormat> {
  longFormat(): string;
  shortFormat(): string;
  formatted(format: F): string;
  longFormatWithSeparator(): string;
  shortFormatWithSeparator(): string;
  getCountryCode(): string;
  getIdType(): string;
}
