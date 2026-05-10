import { test, fc } from "@fast-check/vitest";
import { describe, expect } from "vitest";
import { LocalDate } from "@deathbycode/civitas-id-core";
import { PersonalId } from "../../src/core/personal-id.js";
import { PersonalIdFaker } from "../../src/testing/faker/personal-id-faker.js";
import { PnrFormat } from "../../src/format/pnr-format.js";

describe("PersonalId — property-based round-trip invariants", () => {
  // Generators: a valid Swedish birth date in [1927, 2024].
  // Lower bound 1927 keeps ages under 100 as of 2026, so short-format round-trips
  // are unambiguous (centenarians need the '+' separator which SHORT_FORMAT_WITH_STANDARD_SEPARATOR
  // does not emit — round-tripping via that format is intentionally unsupported for ages ≥ 100).
  // Upper bound 2024 avoids future-born IDs which fail validation.
  const validBirthDate = fc
    .record({
      year: fc.integer({ min: 1927, max: 2024 }),
      month: fc.integer({ min: 1, max: 12 }),
      day: fc.integer({ min: 1, max: 31 }),
    })
    .filter(({ year, month, day }) => LocalDate.of(year, month, day).isValid());

  test.prop([validBirthDate])(
    "faker-generated PersonalId.longFormat() round-trips through parseOrThrow",
    ({ year, month, day }) => {
      const id = PersonalIdFaker.createFor(year, month, day);
      const parsed = PersonalId.parseOrThrow(id.longFormat());
      expect(parsed.equals(id)).toBe(true);
    },
  );

  test.prop([validBirthDate])(
    "faker-generated PersonalId.shortFormatWithSeparator() round-trips through parseOrThrow",
    ({ year, month, day }) => {
      const id = PersonalIdFaker.createFor(year, month, day);
      const parsed = PersonalId.parseOrThrow(id.shortFormatWithSeparator());
      expect(parsed.equals(id)).toBe(true);
    },
  );

  test.prop([validBirthDate])(
    "faker-generated PersonalId.longFormatWithSeparator() round-trips",
    ({ year, month, day }) => {
      const id = PersonalIdFaker.createFor(year, month, day);
      const parsed = PersonalId.parseOrThrow(id.longFormatWithSeparator());
      expect(parsed.equals(id)).toBe(true);
    },
  );

  test.prop([validBirthDate])(
    "format LONG_FORMAT_WITH_STANDARD_SEPARATOR is always a 13-character string with '-' at index 8",
    ({ year, month, day }) => {
      const id = PersonalIdFaker.createFor(year, month, day);
      const formatted = id.formatted(PnrFormat.LONG_FORMAT_WITH_STANDARD_SEPARATOR);
      expect(formatted).toHaveLength(13);
      expect(formatted[8]).toBe("-");
    },
  );

  test.prop([validBirthDate])(
    "PersonalId.isValid agrees with parseOrThrow for any faker-generated ID",
    ({ year, month, day }) => {
      const id = PersonalIdFaker.createFor(year, month, day);
      const long = id.longFormat();
      expect(PersonalId.isValid(long)).toBe(true);
      // And parseOrThrow does not throw.
      expect(() => PersonalId.parseOrThrow(long)).not.toThrow();
    },
  );
});
