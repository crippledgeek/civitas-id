import { LocalDate } from "@civitas-id/core";
import { describe, expect, it } from "vitest";
import { getGenderDigit, isValidPersonDate } from "../../src/core/person-official-id-base.js";
import { CoordinationId, PersonOfficialIdBase, PersonalId } from "../../src/core/swedish-ids.js";
import { IllegalIdNumberException } from "../../src/error/illegal-id-number-exception.js";
import { PnrFormat } from "../../src/format/pnr-format.js";
import { PersonalIdFaker } from "../../src/testing/faker/personal-id-faker.js";
import { SwedishLuhnAlgorithm } from "../../src/validation/swedish-luhn-algorithm.js";
import { loadCsv } from "../helpers/csv-loader.js";

// ===== CSV-driven: age, gender, adult, child =====

describe("PersonOfficialId CSV — age, gender, adult/child", () => {
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

  // Fixed clock: 2025-04-23
  const fixedClock: () => LocalDate = () => LocalDate.of(2025, 4, 23);

  it.each(rows)("PersonOfficialId $Testpersonnummer valid=$Valid", (row) => {
    const expectedValid = row.Valid.toLowerCase() === "true";
    expect(PersonOfficialIdBase.isValid(row.Testpersonnummer)).toBe(expectedValid);

    if (expectedValid) {
      let id: PersonalId | CoordinationId;
      if (PersonalId.isValid(row.Testpersonnummer)) {
        id = PersonalId.parseOrThrow(row.Testpersonnummer);
      } else {
        id = CoordinationId.parseOrThrow(row.Testpersonnummer);
      }

      expect(id.isFemale()).toBe(row.Female.toLowerCase() === "true");
      expect(id.isMale()).toBe(row.Male.toLowerCase() === "true");
      expect(id.isAdult(fixedClock)).toBe(row.Adult.toLowerCase() === "true");
      expect(id.isChild(fixedClock)).toBe(row.Child.toLowerCase() === "true");
      expect(id.getAge(fixedClock)).toBe(Number.parseInt(row.Age, 10));
    }
  });
});

// ===== isValid() =====

describe("PersonOfficialId isValid()", () => {
  it("returns true for valid personal ID", () => {
    expect(PersonOfficialIdBase.isValid("189001159806")).toBe(true);
  });

  it("returns true for valid coordination ID", () => {
    expect(PersonOfficialIdBase.isValid("191601612383")).toBe(true);
  });

  it("returns false for invalid input", () => {
    expect(PersonOfficialIdBase.isValid("not-an-id")).toBe(false);
  });
});

// ===== parse type dispatch =====

describe("PersonOfficialId parse type dispatch", () => {
  it("parses valid personal ID as PersonalId", () => {
    const id = PersonalId.parseOrThrow("189001159806");
    expect(id).toBeInstanceOf(PersonalId);
  });

  it("parses valid coordination ID as CoordinationId", () => {
    const id = CoordinationId.parseOrThrow("191601612383");
    expect(id).toBeInstanceOf(CoordinationId);
  });

  it("PersonOfficialIdBase.format() throws for invalid input", () => {
    const err = (() => {
      try {
        PersonOfficialIdBase.format("not-an-id", PnrFormat.LONG_FORMAT);
        return undefined;
      } catch (e) {
        return e;
      }
    })() as IllegalIdNumberException;
    expect(err).toBeInstanceOf(IllegalIdNumberException);
    expect(err.message).toContain("Invalid person official ID");
  });
});

// ===== isAdult / isChild with fixed clock =====

describe("PersonOfficialId isAdult/isChild with fixed clock", () => {
  it("returns true for child (10 years old) using fixed clock", () => {
    // Fixed clock: 2025-04-23; birth date: 2015-04-23 → age 10 → child
    const fixedClock: () => LocalDate = () => LocalDate.of(2025, 4, 23);
    const id = PersonalIdFaker.personalId().createFor(2015, 4, 23);
    expect(id.isChild(fixedClock)).toBe(true);
    expect(id.isAdult(fixedClock)).toBe(false);
  });

  it("returns false for child and true for adult (25 years old) using fixed clock", () => {
    // Fixed clock: 2025-04-23; birth date: 2000-04-23 → age 25 → adult
    const fixedClock: () => LocalDate = () => LocalDate.of(2025, 4, 23);
    const id = PersonalIdFaker.personalId().createFor(2000, 4, 23);
    expect(id.isChild(fixedClock)).toBe(false);
    expect(id.isAdult(fixedClock)).toBe(true);
  });
});

// ===== isAdult / isChild no-arg (system clock) =====

describe("PersonOfficialId isAdult/isChild no-arg", () => {
  it("isAdult() no-arg returns true for born 2000-01-01", () => {
    const id = PersonalIdFaker.personalId().createFor(2000, 1, 1);
    expect(id.isAdult()).toBe(true);
  });

  it("isChild() no-arg returns true for young person", () => {
    const currentYear = new Date().getUTCFullYear();
    const birthYear = currentYear - 5;
    // Find a valid 5-year-old ID
    let found: PersonalId | undefined;
    for (let i = 0; i < 1000; i++) {
      const base = `${String(birthYear % 100).padStart(2, "0")}0101${String(i).padStart(3, "0")}`;
      const checkDigit = SwedishLuhnAlgorithm.calculateCheckDigit(base);
      const fullId = base + checkDigit;
      if (PersonalId.isValid(fullId)) {
        found = PersonalId.parseOrThrow(fullId);
        break;
      }
    }
    expect(found).toBeDefined();
    if (found) expect(found.isChild()).toBe(true);
  });

  it("getAge() no-arg returns age around 25 for born 2000-01-01", () => {
    const id = PersonalIdFaker.personalId().createFor(2000, 1, 1);
    const age = id.getAge();
    expect(age).toBeGreaterThanOrEqual(24);
    expect(age).toBeLessThanOrEqual(26);
  });
});

// ===== PersonOfficialIdBase.format() =====

describe("PersonOfficialIdBase.format()", () => {
  it("formats personal ID with LONG_FORMAT", () => {
    const id = PersonalIdFaker.personalId().createFor(2024, 7, 13);
    const formatted = PersonOfficialIdBase.format(id.longFormat(), PnrFormat.LONG_FORMAT);
    expect(formatted).toBe(id.longFormat());
  });
});

// ===== Internal helpers: isValidPersonDate, getGenderDigit =====

describe("isValidPersonDate edge cases", () => {
  it("returns false for completely non-numeric input", () => {
    expect(isValidPersonDate("ABCDEFGH-IJKL")).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(isValidPersonDate("")).toBe(false);
  });
});

describe("getGenderDigit edge cases", () => {
  it("throws for non-digit gender character", () => {
    // Internal format is YYYYMMDD-BBBC (13 chars), gender digit at index 11
    // This is an internal error guard (unreachable in normal use), throws plain Error
    expect(() => getGenderDigit("20240713-23X4")).toThrow(Error);
    expect(() => getGenderDigit("20240713-23X4")).toThrow("Internal error");
  });
});
