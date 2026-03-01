/**
 * Formats for Swedish personal identity numbers.
 */
export const PnrFormat = {
  /** YYYYMMDD-XXXX or YYYYMMDD+XXXX depending on the age of the holder. */
  LONG_FORMAT_WITH_SEPARATOR: "LONG_FORMAT_WITH_SEPARATOR",
  /** YYYYMMDD-XXXX with a - delimiter regardless of the age of the holder. */
  LONG_FORMAT_WITH_STANDARD_SEPARATOR: "LONG_FORMAT_WITH_STANDARD_SEPARATOR",
  /** YYYYMMDDXXXX. */
  LONG_FORMAT: "LONG_FORMAT",
  /** YYMMDD-XXXX or YYMMDD+XXXX depending on the age of the holder. */
  SHORT_FORMAT_WITH_SEPARATOR: "SHORT_FORMAT_WITH_SEPARATOR",
  /** YYMMDD-XXXX with a - delimiter regardless of the age of the holder. */
  SHORT_FORMAT_WITH_STANDARD_SEPARATOR: "SHORT_FORMAT_WITH_STANDARD_SEPARATOR",
  /** YYMMDDXXXX. */
  SHORT_FORMAT: "SHORT_FORMAT",
} as const;

export type PnrFormat = (typeof PnrFormat)[keyof typeof PnrFormat];
