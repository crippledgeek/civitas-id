import { LocalDate } from "@civitas-id/core";
import { describe, expect, it } from "vitest";
import { OrganisationId, PersonalId } from "../../src/core/swedish-ids.js";
import { PnrFormat } from "../../src/format/pnr-format.js";
import { PersonalIdFaker } from "../../src/testing/faker/personal-id-faker.js";
import { loadCsv } from "../helpers/csv-loader.js";

describe("PersonalId CSV — 1890s numbers", () => {
  const ids = loadCsv("Testpersonnummer 1890-1899.csv");
  it.each(ids)("isValid(%s)", (id) => {
    expect(PersonalId.isValid(id)).toBe(true);
  });
});

describe("PersonalId CSV — extended test data", () => {
  interface PnrRow {
    Testpersonnummer: string;
    Female: string;
    Male: string;
    Adult: string;
    Child: string;
    Age: string;
    Valid: string;
  }

  function loadPnrRows(): PnrRow[] {
    const lines = loadCsv("testpersonnummer_final.csv");
    const headers = (lines[0] as string).split(",").map((h) => h.trim());
    return lines.slice(1).map((line) => {
      const values = line.split(",").map((v) => v.trim());
      const row: Record<string, string> = {};
      headers.forEach((h, i) => {
        row[h] = values[i] ?? "";
      });
      return row as unknown as PnrRow;
    });
  }

  const rows = loadPnrRows();

  it.each(rows)("PersonalId $Testpersonnummer valid=$Valid", (row) => {
    const expectedValid = row.Valid.toLowerCase() === "true";
    expect(PersonalId.isValid(row.Testpersonnummer)).toBe(expectedValid);

    if (expectedValid) {
      const id = PersonalId.parseOrThrow(row.Testpersonnummer);
      const expectedAge = Number.parseInt(row.Age, 10);

      // Use a clock that gives the expected age:
      // Set date to one day before birthday at (expectedAge+1) years
      const birthDate = id.getBirthDate();
      const targetYear = birthDate.year + expectedAge + 1;
      let clockYear = targetYear;
      let clockMonth = birthDate.month;
      let clockDay = birthDate.day - 1;
      if (clockDay < 1) {
        clockMonth -= 1;
        if (clockMonth < 1) {
          clockMonth = 12;
          clockYear -= 1;
        }
        // Use last day of the previous month (approximate)
        clockDay = new Date(clockYear, clockMonth, 0).getDate();
      }
      const testDate = LocalDate.of(clockYear, clockMonth, clockDay);
      const clockFn = () => testDate;

      expect(id.isFemale()).toBe(row.Female.toLowerCase() === "true");
      expect(id.isMale()).toBe(row.Male.toLowerCase() === "true");
      expect(id.getAge(clockFn)).toBe(expectedAge);
    }
  });
});

describe("PersonalId format methods", () => {
  it("format() with LONG_FORMAT returns same as longFormat()", () => {
    const id = PersonalIdFaker.personalId().createFor(2024, 7, 13);
    expect(PersonalId.format(id.longFormat(), PnrFormat.LONG_FORMAT)).toBe(id.longFormat());
  });

  it("format() with SHORT_FORMAT strips first 2 characters", () => {
    const id = PersonalIdFaker.personalId().createFor(2024, 7, 13);
    expect(PersonalId.format(id.longFormat(), PnrFormat.SHORT_FORMAT)).toBe(
      id.longFormat().substring(2),
    );
  });

  it("LONG_FORMAT_WITH_SEPARATOR contains dash", () => {
    const id = PersonalIdFaker.personalId().createFor(2024, 7, 13);
    expect(id.formatted(PnrFormat.LONG_FORMAT_WITH_SEPARATOR)).toContain("-");
  });

  it("LONG_FORMAT_WITH_SEPARATOR contains plus for centenarian", () => {
    const id = PersonalIdFaker.personalId().createFor(1920, 1, 1);
    expect(id.formatted(PnrFormat.LONG_FORMAT_WITH_SEPARATOR)).toContain("+");
  });

  it("SHORT_FORMAT_WITH_SEPARATOR has length 11 and contains dash", () => {
    const id = PersonalIdFaker.personalId().createFor(2024, 7, 13);
    const formatted = id.formatted(PnrFormat.SHORT_FORMAT_WITH_SEPARATOR);
    expect(formatted).toContain("-");
    expect(formatted).toHaveLength(11);
  });

  it("LONG_FORMAT_WITH_STANDARD_SEPARATOR forces minus for centenarian", () => {
    const id = PersonalIdFaker.personalId().createFor(1920, 1, 1);
    const formatted = id.formatted(PnrFormat.LONG_FORMAT_WITH_STANDARD_SEPARATOR);
    expect(formatted).toContain("-");
    expect(formatted).not.toContain("+");
  });

  it("LONG_FORMAT has no separator and length 12", () => {
    const id = PersonalIdFaker.personalId().createFor(2024, 7, 13);
    const formatted = id.formatted(PnrFormat.LONG_FORMAT);
    expect(formatted).not.toContain("-");
    expect(formatted).not.toContain("+");
    expect(formatted).toHaveLength(12);
  });

  it("SHORT_FORMAT has no separator and length 10", () => {
    const id = PersonalIdFaker.personalId().createFor(2024, 7, 13);
    const formatted = id.formatted(PnrFormat.SHORT_FORMAT);
    expect(formatted).not.toContain("-");
    expect(formatted).not.toContain("+");
    expect(formatted).toHaveLength(10);
  });
});

describe("PersonalId parse methods", () => {
  it("parse() returns PersonalId for valid input", () => {
    const id = PersonalIdFaker.personalId().createFor(2024, 7, 13);
    const result = PersonalId.parse(id.longFormat());
    expect(result).toBeDefined();
    expect(result?.longFormat()).toBe(id.longFormat());
  });

  it("parse() returns undefined for invalid input", () => {
    expect(PersonalId.parse("invalid")).toBeUndefined();
  });

  it("parse() returns undefined for null", () => {
    expect(PersonalId.parse(null)).toBeUndefined();
  });

  it("parseOrThrow() returns PersonalId for valid input", () => {
    const id = PersonalIdFaker.personalId().createFor(2024, 7, 13);
    const parsed = PersonalId.parseOrThrow(id.longFormat());
    expect(parsed.longFormat()).toBe(id.longFormat());
  });

  it("parseOrThrow() throws for invalid input", () => {
    expect(() => PersonalId.parseOrThrow("invalid")).toThrow();
  });

  it("parseOrThrow() throws for null", () => {
    expect(() => PersonalId.parseOrThrow(null as unknown as string)).toThrow();
  });
});

describe("PersonalId birth date validation", () => {
  it("rejects dates before 1880-01-01", () => {
    expect(PersonalId.isValid("18791231-1234")).toBe(false);
    expect(PersonalId.isValid("18790101-5678")).toBe(false);
  });

  it("accepts dates on or after 1880-01-01", () => {
    const id1880 = PersonalIdFaker.personalId().createFor(1880, 1, 1);
    expect(PersonalId.isValid(id1880.longFormat())).toBe(true);
  });

  it("rejects invalid month values", () => {
    expect(PersonalId.isValid("19900015-1234")).toBe(false);
    expect(PersonalId.isValid("19901315-1234")).toBe(false);
  });

  it("rejects invalid day values", () => {
    expect(PersonalId.isValid("19900100-1234")).toBe(false);
    expect(PersonalId.isValid("19900132-1234")).toBe(false);
  });

  it("handles leap years correctly", () => {
    const leapDay = PersonalIdFaker.personalId().createFor(2000, 2, 29);
    expect(PersonalId.isValid(leapDay.longFormat())).toBe(true);
    expect(PersonalId.isValid("20010229-1234")).toBe(false);
  });

  it("young person (under 100) should have dash delimiter", () => {
    const id = PersonalIdFaker.personalId().createFor(2000, 5, 15);
    const withSep = id.longFormatWithSeparator();
    expect(withSep).toContain("-");
    expect(PersonalId.isValid(withSep)).toBe(true);
    const withPlus = withSep.replace("-", "+");
    expect(PersonalId.isValid(withPlus)).toBe(false);
  });

  it("centenarian can have both delimiters", () => {
    const id = PersonalIdFaker.personalId().createFor(1920, 5, 15);
    const withSep = id.longFormatWithSeparator();
    expect(PersonalId.isValid(withSep)).toBe(true);
    const withMinus = withSep.replace("+", "-");
    expect(PersonalId.isValid(withMinus)).toBe(true);
  });

  it("rejects dates before 1880-01-01 (edge cases)", () => {
    expect(PersonalId.isValid("18500515-9012")).toBe(false);
    expect(PersonalId.isValid("18791231-0000")).toBe(false);
  });

  it("accepts dates on or after 1880-01-02", () => {
    const id1880Jan2 = PersonalIdFaker.personalId().createFor(1880, 1, 2);
    expect(PersonalId.isValid(id1880Jan2.longFormat())).toBe(true);
  });

  it("rejects invalid months (00 and 99)", () => {
    expect(PersonalId.isValid("19909915-1234")).toBe(false);
  });

  it("rejects invalid days (30 in February, 31 in April)", () => {
    expect(PersonalId.isValid("19900230-1234")).toBe(false);
    expect(PersonalId.isValid("19900431-1234")).toBe(false);
  });

  it("rejects malformed date strings", () => {
    expect(PersonalId.isValid("199a0515-1234")).toBe(false);
    expect(PersonalId.isValid("1990b515-1234")).toBe(false);
    expect(PersonalId.isValid("199005c5-1234")).toBe(false);
    expect(PersonalId.isValid("9900515-1234")).toBe(false);
    expect(PersonalId.isValid("199900515-1234")).toBe(false);
  });

  it("rejects invalid delimiters (space, slash, underscore)", () => {
    const id = PersonalIdFaker.personalId().createFor(1990, 5, 15);
    const withSep = id.longFormatWithSeparator();
    const withSpace = `${withSep.substring(0, 8)} ${withSep.substring(9)}`;
    const withSlash = `${withSep.substring(0, 8)}/${withSep.substring(9)}`;
    const withUnderscore = `${withSep.substring(0, 8)}_${withSep.substring(9)}`;
    expect(PersonalId.isValid(withSpace)).toBe(false);
    expect(PersonalId.isValid(withSlash)).toBe(false);
    expect(PersonalId.isValid(withUnderscore)).toBe(false);
  });

  it("catches DateTimeParseException for invalid date combinations", () => {
    expect(PersonalId.isValid("20000230-1234")).toBe(false);
    expect(PersonalId.isValid("20000231-1234")).toBe(false);
    expect(PersonalId.isValid("20000431-1234")).toBe(false);
    expect(PersonalId.isValid("20000631-1234")).toBe(false);
    expect(PersonalId.isValid("20000931-1234")).toBe(false);
    expect(PersonalId.isValid("20001131-1234")).toBe(false);
  });

  it("handles edge case dates", () => {
    expect(
      PersonalId.isValid(PersonalIdFaker.personalId().createFor(2000, 1, 1).longFormat()),
    ).toBe(true);
    expect(
      PersonalId.isValid(PersonalIdFaker.personalId().createFor(2000, 12, 31).longFormat()),
    ).toBe(true);
    expect(
      PersonalId.isValid(PersonalIdFaker.personalId().createFor(2000, 2, 29).longFormat()),
    ).toBe(true);
    expect(
      PersonalId.isValid(PersonalIdFaker.personalId().createFor(2001, 2, 28).longFormat()),
    ).toBe(true);
  });

  it("handles leap year 2004-02-29", () => {
    const leapDay2004 = PersonalIdFaker.personalId().createFor(2004, 2, 29);
    expect(PersonalId.isValid(leapDay2004.longFormat())).toBe(true);
  });
});

describe("PersonalId optional-style API", () => {
  it("parse() chains with optional chaining to birth date", () => {
    const id = PersonalIdFaker.personalId().createFor(2024, 7, 13);
    const birthDate = PersonalId.parse(id.longFormat())?.getBirthDate();
    expect(birthDate).toBeDefined();
    expect(birthDate?.year).toBe(2024);
    expect(birthDate?.month).toBe(7);
    expect(birthDate?.day).toBe(13);
  });

  it("parse() with invalid input returns undefined birth date chain", () => {
    const birthDate = PersonalId.parse("invalid")?.getBirthDate();
    expect(birthDate).toBeUndefined();
  });

  it("parse() filter-like for adult status (2024 birth → not adult)", () => {
    const child = PersonalIdFaker.personalId().createFor(2024, 7, 13);
    const result = PersonalId.parse(child.longFormat());
    const adultOnly = result?.isAdult() ? result : undefined;
    expect(adultOnly).toBeUndefined();
  });

  it("parse() filter-like passes adults (1990 birth)", () => {
    const adult = PersonalIdFaker.personalId().createFor(1990, 1, 1);
    const result = PersonalId.parse(adult.longFormat());
    const adultOnly = result?.isAdult() ? result : undefined;
    expect(adultOnly).toBeDefined();
  });

  it("LONG_FORMAT_WITH_SEPARATOR preserves minus separator for young person", () => {
    const idWithMinus = PersonalIdFaker.personalId().createFor(2024, 7, 13);
    const withMinus = `${idWithMinus.longFormat().substring(0, 8)}-${idWithMinus.longFormat().substring(8)}`;
    const parsedWithMinus = PersonalId.parseOrThrow(withMinus);
    expect(parsedWithMinus.formatted(PnrFormat.LONG_FORMAT_WITH_SEPARATOR)).toContain("-");
  });

  it("LONG_FORMAT_WITH_SEPARATOR preserves plus separator for centenarian", () => {
    const idWithPlus = PersonalIdFaker.personalId().createFor(1920, 1, 1);
    expect(idWithPlus.formatted(PnrFormat.LONG_FORMAT_WITH_SEPARATOR)).toContain("+");
  });

  it("SHORT_FORMAT_WITH_SEPARATOR has length 11 and preserves separator", () => {
    const idWithMinus = PersonalIdFaker.personalId().createFor(2024, 7, 13);
    const withMinus = `${idWithMinus.longFormat().substring(0, 8)}-${idWithMinus.longFormat().substring(8)}`;
    const parsedWithMinus = PersonalId.parseOrThrow(withMinus);
    const shortFormatted = parsedWithMinus.formatted(PnrFormat.SHORT_FORMAT_WITH_SEPARATOR);
    expect(shortFormatted).toContain("-");
    expect(shortFormatted).toHaveLength(11);

    const idWithPlus = PersonalIdFaker.personalId().createFor(1920, 1, 1);
    const shortFormattedPlus = idWithPlus.formatted(PnrFormat.SHORT_FORMAT_WITH_SEPARATOR);
    expect(shortFormattedPlus).toContain("+");
    expect(shortFormattedPlus).toHaveLength(11);
  });

  it("LONG_FORMAT_WITH_STANDARD_SEPARATOR forces minus for centenarian", () => {
    const idWithPlus = PersonalIdFaker.personalId().createFor(1920, 1, 1);
    const formatted = idWithPlus.formatted(PnrFormat.LONG_FORMAT_WITH_STANDARD_SEPARATOR);
    expect(formatted).toContain("-");
    expect(formatted).not.toContain("+");
  });

  it("SHORT_FORMAT_WITH_STANDARD_SEPARATOR forces minus (length 11)", () => {
    const idWithPlus = PersonalIdFaker.personalId().createFor(1920, 1, 1);
    const formatted = idWithPlus.formatted(PnrFormat.SHORT_FORMAT_WITH_STANDARD_SEPARATOR);
    expect(formatted).toContain("-");
    expect(formatted).not.toContain("+");
    expect(formatted).toHaveLength(11);
  });

  it("LONG_FORMAT has no separator and is 12 chars", () => {
    const id = PersonalIdFaker.personalId().createFor(2024, 7, 13);
    const formatted = id.formatted(PnrFormat.LONG_FORMAT);
    expect(formatted).not.toContain("-");
    expect(formatted).not.toContain("+");
    expect(formatted).toHaveLength(12);
  });

  it("SHORT_FORMAT has no separator and is 10 chars", () => {
    const id = PersonalIdFaker.personalId().createFor(2024, 7, 13);
    const formatted = id.formatted(PnrFormat.SHORT_FORMAT);
    expect(formatted).not.toContain("-");
    expect(formatted).not.toContain("+");
    expect(formatted).toHaveLength(10);
  });
});

describe("PersonalId conversion methods", () => {
  it("isPhysicalPerson() returns true", () => {
    const id = PersonalIdFaker.personalId().create();
    expect(id.isPhysicalPerson()).toBe(true);
    expect(id.isLegalPerson()).toBe(false);
  });

  it("toPersonOfficialId() returns itself", () => {
    const id = PersonalIdFaker.personalId().create();
    const person = id.toPersonOfficialId();
    expect(person).toBe(id);
  });

  it("toOrganisationId() converts to physical person OrganisationId", () => {
    const id = PersonalIdFaker.personalId().create();
    const orgId = id.toOrganisationId();
    expect(orgId).toBeInstanceOf(OrganisationId);
    expect(orgId.isPhysicalPerson()).toBe(true);
  });

  it("toString() returns longFormat", () => {
    const id = PersonalIdFaker.personalId().create();
    expect(id.toString()).toBe(id.longFormat());
  });
});
