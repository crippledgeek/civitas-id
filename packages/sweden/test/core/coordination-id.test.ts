import { LocalDate } from "@civitas-id/core";
import { describe, expect, it } from "vitest";
import { CoordinationId, OrganisationId } from "../../src/core/swedish-ids.js";
import { PnrFormat } from "../../src/format/pnr-format.js";
import { CoordinationIdFaker } from "../../src/testing/faker/coordination-id-faker.js";
import { loadCsv } from "../helpers/csv-loader.js";

function clockForExpectedAge(birthDate: LocalDate, expectedAge: number): () => LocalDate {
  // The test date: 1 day before the birthday at expectedAge+1 years
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
    clockDay = new Date(clockYear, clockMonth, 0).getDate();
  }
  return () => LocalDate.of(clockYear, clockMonth, clockDay);
}

describe("CoordinationId CSV — test data", () => {
  interface SamRow {
    Testpersonnummer: string;
    Female: string;
    Male: string;
    Age: string;
    Adult: string;
    Child: string;
    Valid: string;
  }

  function loadSamRows(): SamRow[] {
    const lines = loadCsv("Testsamordningsnummer_2019_corrected.csv");
    const headers = (lines[0] as string).split(",").map((h) => h.trim());
    return lines.slice(1).map((line) => {
      const values = line.split(",").map((v) => v.trim());
      const row: Record<string, string> = {};
      headers.forEach((h, i) => {
        row[h] = values[i] ?? "";
      });
      return row as unknown as SamRow;
    });
  }

  const rows = loadSamRows();

  it.each(rows)("CoordinationId $Testpersonnummer valid=$Valid", (row) => {
    const expectedValid = row.Valid.toLowerCase() === "true";
    expect(CoordinationId.isValid(row.Testpersonnummer)).toBe(expectedValid);

    if (expectedValid) {
      const id = CoordinationId.parseOrThrow(row.Testpersonnummer);
      const expectedAge = Number.parseInt(row.Age, 10);
      const clockFn = clockForExpectedAge(id.getBirthDate(), expectedAge);

      expect(id.isFemale()).toBe(row.Female.toLowerCase() === "true");
      expect(id.isMale()).toBe(row.Male.toLowerCase() === "true");
      expect(id.getAge(clockFn)).toBe(expectedAge);
      expect(id.isAdult(clockFn)).toBe(row.Adult.toLowerCase() === "true");
      expect(id.isChild(clockFn)).toBe(row.Child.toLowerCase() === "true");
    }
  });
});

describe("CoordinationId format methods", () => {
  it("parses short format with inferred century", () => {
    const id = CoordinationIdFaker.coordinationId().createFor(1982, 6, 22);
    const longFmt = id.longFormat();
    const shortWithSep = `${longFmt.substring(2, 8)}-${longFmt.substring(8)}`;
    const parsed = CoordinationId.parseOrThrow(shortWithSep);
    expect(parsed.longFormat()).toBe(id.longFormat());
  });

  it("isValid() validates short format", () => {
    const id = CoordinationIdFaker.coordinationId().createFor(1982, 6, 22);
    const short = `${id.longFormat().substring(2, 8)}-${id.longFormat().substring(8)}`;
    expect(CoordinationId.isValid(short)).toBe(true);
  });

  it("format() with LONG_FORMAT returns 12-char no-separator format", () => {
    const id = CoordinationIdFaker.coordinationId().createFor(1982, 6, 22);
    const formatted = CoordinationId.format(id.longFormat(), PnrFormat.LONG_FORMAT);
    expect(formatted).toHaveLength(12);
    expect(formatted).not.toContain("-");
    expect(formatted).not.toContain("+");
    // Round-trip: parsing formatted should give same ID
    expect(CoordinationId.parseOrThrow(formatted).longFormat()).toBe(id.longFormat());
  });

  it("LONG_FORMAT_WITH_SEPARATOR contains dash", () => {
    const id = CoordinationIdFaker.coordinationId().createFor(1982, 6, 22);
    expect(id.formatted(PnrFormat.LONG_FORMAT_WITH_SEPARATOR)).toContain("-");
  });

  it("LONG_FORMAT_WITH_SEPARATOR contains plus for centenarian", () => {
    const id = CoordinationIdFaker.coordinationId().createFor(1920, 3, 15);
    expect(id.formatted(PnrFormat.LONG_FORMAT_WITH_SEPARATOR)).toContain("+");
  });

  it("SHORT_FORMAT_WITH_SEPARATOR has length 11", () => {
    const id = CoordinationIdFaker.coordinationId().createFor(1982, 6, 22);
    expect(id.formatted(PnrFormat.SHORT_FORMAT_WITH_SEPARATOR)).toHaveLength(11);
  });

  it("LONG_FORMAT has no separator and length 12", () => {
    const id = CoordinationIdFaker.coordinationId().createFor(1982, 6, 22);
    const formatted = id.formatted(PnrFormat.LONG_FORMAT);
    expect(formatted).not.toContain("-");
    expect(formatted).not.toContain("+");
    expect(formatted).toHaveLength(12);
  });

  it("SHORT_FORMAT has no separator and length 10", () => {
    const id = CoordinationIdFaker.coordinationId().createFor(1982, 6, 22);
    const formatted = id.formatted(PnrFormat.SHORT_FORMAT);
    expect(formatted).not.toContain("-");
    expect(formatted).not.toContain("+");
    expect(formatted).toHaveLength(10);
  });
});

describe("CoordinationId parse methods", () => {
  it("parse() returns CoordinationId for valid input", () => {
    const id = CoordinationIdFaker.coordinationId().createFor(1985, 3, 15);
    const result = CoordinationId.parse(id.longFormat());
    expect(result).toBeDefined();
    expect(result?.longFormat()).toBe(id.longFormat());
  });

  it("parse() returns undefined for invalid input", () => {
    expect(CoordinationId.parse("invalid")).toBeUndefined();
  });

  it("parseOrThrow() throws for invalid input", () => {
    expect(() => CoordinationId.parseOrThrow("invalid")).toThrow();
  });
});

describe("CoordinationId birth date", () => {
  it("getBirthDate() returns actual birth date (day - 60)", () => {
    const birthYear = 1985;
    const birthMonth = 6;
    const birthDay = 15;
    const id = CoordinationIdFaker.coordinationId().createFor(birthYear, birthMonth, birthDay);
    const birthDate = id.getBirthDate();
    expect(birthDate.year).toBe(birthYear);
    expect(birthDate.month).toBe(birthMonth);
    expect(birthDate.day).toBe(birthDay);
  });

  it("coordination ID day component is birthDay + 60", () => {
    const id = CoordinationIdFaker.coordinationId().createFor(1990, 4, 5);
    const longFmt = id.longFormat();
    const dayInId = Number.parseInt(longFmt.substring(6, 8), 10);
    expect(dayInId).toBe(5 + 60);
  });
});

describe("CoordinationId conversion methods", () => {
  it("isPhysicalPerson() returns true", () => {
    const id = CoordinationIdFaker.coordinationId().create();
    expect(id.isPhysicalPerson()).toBe(true);
    expect(id.isLegalPerson()).toBe(false);
  });

  it("toPersonOfficialId() returns itself", () => {
    const id = CoordinationIdFaker.coordinationId().create();
    const person = id.toPersonOfficialId();
    expect(person).toBe(id);
  });

  it("toOrganisationId() converts to physical person OrganisationId", () => {
    const id = CoordinationIdFaker.coordinationId().create();
    const orgId = id.toOrganisationId();
    expect(orgId).toBeInstanceOf(OrganisationId);
    expect(orgId.isPhysicalPerson()).toBe(true);
  });

  it("toString() returns longFormat", () => {
    const id = CoordinationIdFaker.coordinationId().create();
    expect(id.toString()).toBe(id.longFormat());
  });

  it("getCountryCode() returns SE", () => {
    const id = CoordinationIdFaker.coordinationId().create();
    expect(id.getCountryCode()).toBe("SE");
  });

  it("shortFormatWithSeparator() returns 10-digit format with separator", () => {
    const id = CoordinationIdFaker.coordinationId().create();
    const short = id.shortFormatWithSeparator();
    expect(short).toMatch(/^\d{6}-\d{4}$/);
  });

  it("shortFormat() returns 10-digit format without separator", () => {
    const id = CoordinationIdFaker.coordinationId().create();
    const short = id.shortFormat();
    expect(short).toMatch(/^\d{10}$/);
  });
});
