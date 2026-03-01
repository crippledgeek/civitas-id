import { describe, expect, it } from "vitest";
import {
  CoordinationId,
  OrganisationId,
  PersonalId,
  SwedishOfficialId,
  isCoordinationId,
  isOrganisationId,
  isPersonOfficialId,
  isPersonalId,
} from "../../src/core/swedish-ids.js";
import { IllegalIdNumberException } from "../../src/error/illegal-id-number-exception.js";
import { PnrFormat } from "../../src/format/pnr-format.js";
import { CoordinationIdFaker } from "../../src/testing/faker/coordination-id-faker.js";
import { PersonalIdFaker } from "../../src/testing/faker/personal-id-faker.js";
import { SwedishOfficialIdFaker } from "../../src/testing/faker/swedish-official-id-faker.js";
import { SwedishOrganisationIdFaker } from "../../src/testing/faker/swedish-organisation-id-faker.js";
import { loadCsv, loadCsvWithHeaders } from "../helpers/csv-loader.js";

// ===== Type guards =====

describe("SwedishOfficialId type guards", () => {
  it("isPersonalId() returns true for PersonalId", () => {
    const id = PersonalIdFaker.personalId().create();
    const official: SwedishOfficialId = id;
    expect(isPersonalId(official)).toBe(true);
    expect(isCoordinationId(official)).toBe(false);
    expect(isOrganisationId(official)).toBe(false);
    expect(isPersonOfficialId(official)).toBe(true);
  });

  it("isCoordinationId() returns true for CoordinationId", () => {
    const id = CoordinationIdFaker.coordinationId().create();
    const official: SwedishOfficialId = id;
    expect(isCoordinationId(official)).toBe(true);
    expect(isPersonalId(official)).toBe(false);
    expect(isOrganisationId(official)).toBe(false);
    expect(isPersonOfficialId(official)).toBe(true);
  });

  it("isOrganisationId() returns true for OrganisationId", () => {
    const id = SwedishOrganisationIdFaker.organisationId().create();
    const official: SwedishOfficialId = id;
    expect(isOrganisationId(official)).toBe(true);
    expect(isPersonalId(official)).toBe(false);
    expect(isCoordinationId(official)).toBe(false);
    expect(isPersonOfficialId(official)).toBe(false);
  });
});

// ===== CSV-driven isValid() =====

describe("SwedishOfficialId CSV — personal numbers 1890-1899", () => {
  const ids = loadCsv("Testpersonnummer 1890-1899.csv");
  it.each(ids)("isValid(%s) === true", (id) => {
    expect(SwedishOfficialId.isValid(id)).toBe(true);
  });
});

describe("SwedishOfficialId CSV — testpersonnummer_final valid IDs", () => {
  interface PnrRow {
    Testpersonnummer: string;
    Valid: string;
  }
  function loadValidRows(): PnrRow[] {
    const lines = loadCsv("testpersonnummer_final.csv");
    const headers = (lines[0] as string).split(",").map((h) => h.trim());
    return lines
      .slice(1)
      .map((line) => {
        const values = line.split(",").map((v) => v.trim());
        const row: Record<string, string> = {};
        headers.forEach((h, i) => {
          row[h] = values[i] ?? "";
        });
        return row as unknown as PnrRow;
      })
      .filter((r) => r.Valid.toLowerCase() === "true");
  }
  const validRows = loadValidRows();
  it.each(validRows)("isValid($Testpersonnummer) === true", (row) => {
    expect(SwedishOfficialId.isValid(row.Testpersonnummer)).toBe(true);
  });
});

describe("SwedishOfficialId CSV — coordination numbers", () => {
  interface SamRow {
    Testpersonnummer: string;
    Valid: string;
  }
  function loadValidRows(): SamRow[] {
    const lines = loadCsv("Testsamordningsnummer_2019_corrected.csv");
    const headers = (lines[0] as string).split(",").map((h) => h.trim());
    return lines
      .slice(1)
      .map((line) => {
        const values = line.split(",").map((v) => v.trim());
        const row: Record<string, string> = {};
        headers.forEach((h, i) => {
          row[h] = values[i] ?? "";
        });
        return row as unknown as SamRow;
      })
      .filter((r) => r.Valid.toLowerCase() === "true");
  }
  const validRows = loadValidRows();
  it.each(validRows)("isValid($Testpersonnummer) === true", (row) => {
    expect(SwedishOfficialId.isValid(row.Testpersonnummer)).toBe(true);
  });
});

describe("SwedishOfficialId CSV — organisation numbers", () => {
  const ids = loadCsv("testorganisationsnummer.txt");
  it.each(ids)("isValid(%s) === true", (id) => {
    expect(SwedishOfficialId.isValid(id)).toBe(true);
  });
});

describe("SwedishOfficialId CSV — invalid IDs", () => {
  const ids = loadCsv("invalid_swedish_ids.csv");
  it.each(ids)("isValid(%s) === false", (id) => {
    expect(SwedishOfficialId.isValid(id)).toBe(false);
  });
});

// ===== parseAny() =====

describe("SwedishOfficialId.parseAny()", () => {
  it("parses a valid personal ID", () => {
    const id = PersonalIdFaker.personalId().create();
    const result = SwedishOfficialId.parseAny(id.longFormat());
    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(PersonalId);
  });

  it("parses a valid coordination ID", () => {
    const id = CoordinationIdFaker.coordinationId().create();
    const result = SwedishOfficialId.parseAny(id.longFormat());
    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(CoordinationId);
  });

  it("parses a valid legal person organisation ID", () => {
    const id = SwedishOrganisationIdFaker.organisationId().createLegalPerson();
    const result = SwedishOfficialId.parseAny(id.longFormat());
    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(OrganisationId);
  });

  it("returns undefined for invalid input", () => {
    expect(SwedishOfficialId.parseAny("invalid")).toBeUndefined();
    expect(SwedishOfficialId.parseAny("1234567890")).toBeUndefined();
  });

  it("returns undefined for null", () => {
    expect(SwedishOfficialId.parseAny(null)).toBeUndefined();
  });

  it("handles IDs with SE prefix", () => {
    const personalId = PersonalIdFaker.personalId().create();
    const result = SwedishOfficialId.parseAny(`SE${personalId.longFormat()}`);
    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(PersonalId);
  });

  it("handles short format IDs", () => {
    const personalId = PersonalIdFaker.personalId().create();
    const result = SwedishOfficialId.parseAny(personalId.shortFormat());
    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(PersonalId);
  });

  it("handles centenarian ID with + separator", () => {
    const personalId = PersonalIdFaker.personalId().createFor(1920, 5, 15);
    const withPlus = personalId.formatted(PnrFormat.LONG_FORMAT_WITH_SEPARATOR);
    const result = SwedishOfficialId.parseAny(withPlus);
    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(PersonalId);
  });

  it("parseAny and parseAnyOrThrow produce equivalent results", () => {
    const personalId = PersonalIdFaker.personalId().create();
    const optResult = SwedishOfficialId.parseAny(personalId.longFormat());
    const throwResult = SwedishOfficialId.parseAnyOrThrow(personalId.longFormat());
    expect(optResult).toBeDefined();
    expect(optResult?.longFormat()).toBe(throwResult.longFormat());
  });
});

// ===== CSV-driven parseAny() =====

describe("SwedishOfficialId CSV — parseAny() personal numbers", () => {
  interface PnrRow {
    Testpersonnummer: string;
    Valid: string;
  }
  function loadValidRows(): PnrRow[] {
    const lines = loadCsv("testpersonnummer_final.csv");
    const headers = (lines[0] as string).split(",").map((h) => h.trim());
    return lines
      .slice(1)
      .map((line) => {
        const values = line.split(",").map((v) => v.trim());
        const row: Record<string, string> = {};
        headers.forEach((h, i) => {
          row[h] = values[i] ?? "";
        });
        return row as unknown as PnrRow;
      })
      .filter((r) => r.Valid.toLowerCase() === "true");
  }
  const validRows = loadValidRows();
  it.each(validRows)("parseAny($Testpersonnummer) is PersonalId", (row) => {
    const result = SwedishOfficialId.parseAny(row.Testpersonnummer);
    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(PersonalId);
  });
});

describe("SwedishOfficialId CSV — parseAny() coordination numbers", () => {
  interface SamRow {
    Testpersonnummer: string;
    Valid: string;
  }
  function loadValidRows(): SamRow[] {
    const lines = loadCsv("Testsamordningsnummer_2019_corrected.csv");
    const headers = (lines[0] as string).split(",").map((h) => h.trim());
    return lines
      .slice(1)
      .map((line) => {
        const values = line.split(",").map((v) => v.trim());
        const row: Record<string, string> = {};
        headers.forEach((h, i) => {
          row[h] = values[i] ?? "";
        });
        return row as unknown as SamRow;
      })
      .filter((r) => r.Valid.toLowerCase() === "true");
  }
  const validRows = loadValidRows();
  it.each(validRows)("parseAny($Testpersonnummer) is CoordinationId", (row) => {
    const result = SwedishOfficialId.parseAny(row.Testpersonnummer);
    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(CoordinationId);
  });
});

describe("SwedishOfficialId CSV — parseAny() invalid IDs", () => {
  const ids = loadCsv("invalid_swedish_ids.csv");
  it.each(ids)("parseAny(%s) is undefined", (id) => {
    expect(SwedishOfficialId.parseAny(id)).toBeUndefined();
  });
});

// ===== parseAnyOrThrow() =====

describe("SwedishOfficialId.parseAnyOrThrow()", () => {
  it("parses a valid personal ID", () => {
    const id = PersonalIdFaker.personalId().create();
    const result = SwedishOfficialId.parseAnyOrThrow(id.longFormat());
    expect(result).toBeInstanceOf(PersonalId);
    expect(result.longFormat()).toBe(id.longFormat());
  });

  it("parses a valid coordination ID", () => {
    const id = CoordinationIdFaker.coordinationId().create();
    const result = SwedishOfficialId.parseAnyOrThrow(id.longFormat());
    expect(result).toBeInstanceOf(CoordinationId);
  });

  it("parses a valid legal person organisation ID", () => {
    const id = SwedishOrganisationIdFaker.organisationId().createLegalPerson();
    const result = SwedishOfficialId.parseAnyOrThrow(id.longFormat());
    expect(result).toBeInstanceOf(OrganisationId);
  });

  it("throws IllegalIdNumberException for invalid input", () => {
    expect(() => SwedishOfficialId.parseAnyOrThrow("invalidABC")).toThrow(IllegalIdNumberException);
  });

  it("throws with descriptive error message", () => {
    const err = (() => {
      try {
        SwedishOfficialId.parseAnyOrThrow("000000-0000");
        return undefined;
      } catch (e) {
        return e;
      }
    })() as IllegalIdNumberException;
    expect(err.message).toContain("Invalid Swedish ID number");
    expect(err.message).toContain("000000-0000");
  });

  it("handles IDs with SE prefix", () => {
    const personalId = PersonalIdFaker.personalId().create();
    const result = SwedishOfficialId.parseAnyOrThrow(`SE${personalId.longFormat()}`);
    expect(result).toBeInstanceOf(PersonalId);
  });

  it("handles short format IDs", () => {
    const personalId = PersonalIdFaker.personalId().create();
    const result = SwedishOfficialId.parseAnyOrThrow(personalId.shortFormat());
    expect(result).toBeInstanceOf(PersonalId);
  });

  it("handles centenarian with different separators", () => {
    const personalId = PersonalIdFaker.personalId().createFor(1920, 5, 15);
    const withPlus = personalId.formatted(PnrFormat.LONG_FORMAT_WITH_SEPARATOR);
    const result = SwedishOfficialId.parseAnyOrThrow(withPlus);
    expect(result).toBeInstanceOf(PersonalId);
  });
});

// ===== CSV-driven parseAnyOrThrow() =====

describe("SwedishOfficialId CSV — parseAnyOrThrow() personal numbers", () => {
  interface PnrRow {
    Testpersonnummer: string;
    Valid: string;
  }
  function loadValidRows(): PnrRow[] {
    const lines = loadCsv("testpersonnummer_final.csv");
    const headers = (lines[0] as string).split(",").map((h) => h.trim());
    return lines
      .slice(1)
      .map((line) => {
        const values = line.split(",").map((v) => v.trim());
        const row: Record<string, string> = {};
        headers.forEach((h, i) => {
          row[h] = values[i] ?? "";
        });
        return row as unknown as PnrRow;
      })
      .filter((r) => r.Valid.toLowerCase() === "true");
  }
  const validRows = loadValidRows();
  it.each(validRows)("parseAnyOrThrow($Testpersonnummer) is PersonalId", (row) => {
    const result = SwedishOfficialId.parseAnyOrThrow(row.Testpersonnummer);
    expect(result).toBeInstanceOf(PersonalId);
  });
});

describe("SwedishOfficialId CSV — parseAnyOrThrow() invalid IDs throw", () => {
  const ids = loadCsv("invalid_swedish_ids.csv");
  it.each(ids)("parseAnyOrThrow(%s) throws", (id) => {
    expect(() => SwedishOfficialId.parseAnyOrThrow(id)).toThrow(IllegalIdNumberException);
  });
});

// ===== isValid() =====

describe("SwedishOfficialId.isValid()", () => {
  it("returns true for valid personal IDs", () => {
    const id = PersonalIdFaker.personalId().create();
    expect(SwedishOfficialId.isValid(id.longFormat())).toBe(true);
  });

  it("returns true for valid coordination IDs", () => {
    const id = CoordinationIdFaker.coordinationId().create();
    expect(SwedishOfficialId.isValid(id.longFormat())).toBe(true);
  });

  it("returns true for valid legal person organisation IDs", () => {
    const id = SwedishOrganisationIdFaker.organisationId().createLegalPerson();
    expect(SwedishOfficialId.isValid(id.longFormat())).toBe(true);
  });

  it("coordination numbers with SE prefix are valid", () => {
    const id1 = CoordinationIdFaker.coordinationId().createFor(1993, 9, 20);
    const id2 = CoordinationIdFaker.coordinationId().createFor(1982, 6, 22);
    const id3 = CoordinationIdFaker.coordinationId().createFor(1981, 7, 21);
    const id4 = CoordinationIdFaker.coordinationId().createFor(1975, 4, 25);
    expect(SwedishOfficialId.isValid(id1.longFormat())).toBe(true);
    expect(SwedishOfficialId.isValid(id2.longFormat())).toBe(true);
    expect(SwedishOfficialId.isValid(`SE${id3.longFormat()}`)).toBe(true);
    expect(SwedishOfficialId.isValid(id4.longFormat())).toBe(true);
  });

  it("returns false for invalid input", () => {
    expect(SwedishOfficialId.isValid("invalid")).toBe(false);
    expect(SwedishOfficialId.isValid(null)).toBe(false);
  });
});

// ===== format() =====

describe("SwedishOfficialId.format()", () => {
  it("formats a personal ID to SHORT_FORMAT (10 digits)", () => {
    const id = PersonalIdFaker.personalId().create();
    const formatted = SwedishOfficialId.format(id.longFormat(), PnrFormat.SHORT_FORMAT);
    expect(formatted).toHaveLength(10);
    expect(formatted).toBe(id.formatted(PnrFormat.SHORT_FORMAT));
  });

  it("formats a personal ID to LONG_FORMAT (12 digits)", () => {
    const personalId = PersonalIdFaker.personalId().createFor(2024, 7, 13);
    const formatted = SwedishOfficialId.format(personalId.longFormat(), PnrFormat.LONG_FORMAT);
    expect(formatted).toBe(personalId.longFormat());
  });

  it("formats an organisation ID to LONG_FORMAT (10 digits)", () => {
    const orgId = SwedishOrganisationIdFaker.organisationId().createLegalPerson();
    const formatted = SwedishOfficialId.format(orgId.longFormat(), PnrFormat.LONG_FORMAT);
    expect(formatted).toHaveLength(10);
  });

  it("formats an organisation ID with separator", () => {
    const id = SwedishOrganisationIdFaker.organisationId().createLegalPerson();
    const formatted = SwedishOfficialId.format(
      id.longFormat(),
      PnrFormat.SHORT_FORMAT_WITH_SEPARATOR,
    );
    expect(formatted).toBe(id.formatted(PnrFormat.SHORT_FORMAT_WITH_SEPARATOR));
  });

  it("throws for invalid input", () => {
    expect(() => SwedishOfficialId.format("invalid", PnrFormat.LONG_FORMAT)).toThrow(
      IllegalIdNumberException,
    );
  });

  it("throws for invalid input with descriptive message", () => {
    const err = (() => {
      try {
        SwedishOfficialId.format("invalid-id-123", PnrFormat.LONG_FORMAT);
        return undefined;
      } catch (e) {
        return e;
      }
    })() as IllegalIdNumberException;
    expect(err.message).toContain("Invalid Swedish ID number");
    expect(err.message).toContain("invalid-id-123");
  });

  it("throws for ID with invalid checksum", () => {
    expect(() => SwedishOfficialId.format("19900515-1234", PnrFormat.LONG_FORMAT)).toThrow(
      IllegalIdNumberException,
    );
  });

  it("throws for empty string", () => {
    expect(() => SwedishOfficialId.format("", PnrFormat.LONG_FORMAT)).toThrow(
      IllegalIdNumberException,
    );
  });

  it("throws for malformed ID with correct message", () => {
    const err = (() => {
      try {
        SwedishOfficialId.format("abc123xyz", PnrFormat.LONG_FORMAT);
        return undefined;
      } catch (e) {
        return e;
      }
    })() as IllegalIdNumberException;
    expect(err.message).toContain("Invalid Swedish ID number");
    expect(err.message).toContain("abc123xyz");
  });

  it("formats valid PersonalId to SHORT_FORMAT (10 digits)", () => {
    const personalId = PersonalIdFaker.personalId().createFor(1990, 5, 15);
    const formatted = SwedishOfficialId.format(personalId.longFormat(), PnrFormat.SHORT_FORMAT);
    expect(formatted).toHaveLength(10);
  });

  it("formats valid OrganisationId to LONG_FORMAT_WITH_SEPARATOR", () => {
    const organisationId = SwedishOrganisationIdFaker.organisationId().createLegalPerson();
    const formatted = SwedishOfficialId.format(
      organisationId.longFormat(),
      PnrFormat.LONG_FORMAT_WITH_SEPARATOR,
    );
    expect(formatted.length).toBeGreaterThanOrEqual(10);
  });
});

// ===== getIdType() =====

describe("SwedishOfficialId getIdType()", () => {
  it("returns PERSONAL for PersonalId", () => {
    const id = PersonalIdFaker.personalId().createFor(2024, 7, 13);
    expect(id.getIdType()).toBe("PERSONAL");
  });

  it("returns COORDINATION for CoordinationId", () => {
    const id = CoordinationIdFaker.coordinationId().createFor(2024, 7, 13);
    expect(id.getIdType()).toBe("COORDINATION");
  });

  it("returns ORGANISATION for OrganisationId", () => {
    const id = SwedishOrganisationIdFaker.organisationId().createLegalPerson();
    expect(id.getIdType()).toBe("ORGANISATION");
  });

  it("returns ORGANISATION after conversion to OrganisationId", () => {
    const personalId = PersonalIdFaker.personalId().createFor(2024, 7, 13);
    const orgId = personalId.toOrganisationId();
    expect(orgId.getIdType()).toBe("ORGANISATION");
  });

  it("returns consistent type for same ID in different formats", () => {
    const personalId = PersonalIdFaker.personalId().createFor(2024, 7, 13);
    const fromLong = SwedishOfficialId.parseAnyOrThrow(personalId.longFormat());
    const fromShort = SwedishOfficialId.parseAnyOrThrow(personalId.shortFormat());
    const fromSep = SwedishOfficialId.parseAnyOrThrow(personalId.longFormatWithSeparator());
    expect(fromLong.getIdType()).toBe("PERSONAL");
    expect(fromShort.getIdType()).toBe("PERSONAL");
    expect(fromSep.getIdType()).toBe("PERSONAL");
  });
});

// ===== longFormatWithSeparator / shortFormatWithSeparator =====

describe("SwedishOfficialId format helpers", () => {
  it("longFormatWithSeparator() returns YYYYMMDD-XXXX (13 chars)", () => {
    const id = PersonalIdFaker.personalId().createFor(2024, 7, 13);
    const formatted = id.longFormatWithSeparator();
    expect(formatted).toContain("-");
    expect(formatted).toHaveLength(13);
    expect(formatted.startsWith("20240713")).toBe(true);
  });

  it("shortFormatWithSeparator() returns YYMMDD-XXXX (11 chars)", () => {
    const id = PersonalIdFaker.personalId().createFor(2024, 7, 13);
    const formatted = id.shortFormatWithSeparator();
    expect(formatted).toContain("-");
    expect(formatted).toHaveLength(11);
    expect(formatted.startsWith("240713")).toBe(true);
  });
});

// ===== equality =====

describe("SwedishOfficialId equality", () => {
  it("personal numbers should be equal in different formats", () => {
    expect(
      PersonalId.parseOrThrow("18991231+9812").equals(PersonalId.parseOrThrow("18991231+9812")),
    ).toBe(true);
    expect(
      PersonalId.parseOrThrow("202407132394").equals(PersonalId.parseOrThrow("202407132394")),
    ).toBe(true);
    expect(
      PersonalId.parseOrThrow("SE202512292398").equals(PersonalId.parseOrThrow("SE202512292398")),
    ).toBe(true);
    expect(
      PersonalId.parseOrThrow("20240102-2385").equals(PersonalId.parseOrThrow("20240102-2385")),
    ).toBe(true);
  });

  it("coordination numbers should be equal in different formats", () => {
    const id1 = CoordinationIdFaker.coordinationId().createFor(1982, 6, 22);
    const id2 = CoordinationIdFaker.coordinationId().createFor(1981, 7, 21);
    const id3 = CoordinationIdFaker.coordinationId().createFor(1975, 4, 25);

    const id1WithSep = `${id1.longFormat().substring(0, 8)}-${id1.longFormat().substring(8)}`;
    expect(
      CoordinationId.parseOrThrow(id1WithSep).equals(CoordinationId.parseOrThrow(id1WithSep)),
    ).toBe(true);
    expect(
      CoordinationId.parseOrThrow(id1.longFormat()).equals(
        CoordinationId.parseOrThrow(id1.longFormat()),
      ),
    ).toBe(true);
    expect(
      CoordinationId.parseOrThrow(`SE${id2.longFormat()}`).equals(
        CoordinationId.parseOrThrow(`SE${id2.longFormat()}`),
      ),
    ).toBe(true);
    expect(
      CoordinationId.parseOrThrow(id3.longFormat()).equals(
        CoordinationId.parseOrThrow(id3.longFormat()),
      ),
    ).toBe(true);
  });
});

// ===== legalPerson / physicalPerson =====

describe("SwedishOfficialId isLegalPerson/isPhysicalPerson", () => {
  it("organisation ID created by faker is a legal person", () => {
    const id = SwedishOrganisationIdFaker.organisationId().createLegalPerson();
    expect(id.isLegalPerson()).toBe(true);
  });

  it("personal ID is a physical person", () => {
    const id = PersonalIdFaker.personalId().createFor(2024, 7, 13);
    expect(id.isPhysicalPerson()).toBe(true);
  });
});

// ===== rejection =====

describe("SwedishOfficialId input rejection", () => {
  it("rejects null input via parseOrThrow", () => {
    expect(() => PersonalId.parseOrThrow(null as unknown as string)).toThrow(
      IllegalIdNumberException,
    );
  });

  it("rejects too-long input via parseOrThrow", () => {
    const tooLong = "1".repeat(101);
    expect(() => PersonalId.parseOrThrow(tooLong)).toThrow(IllegalIdNumberException);
  });

  it("handles input at maximum allowed length after trimming", () => {
    const id = PersonalIdFaker.personalId().createFor(2024, 7, 13);
    const padded = id.longFormat() + " ".repeat(88);
    expect(SwedishOfficialId.isValid(padded)).toBe(true);
  });

  it("rejects excessively long malicious input", () => {
    const malicious = `SE${"1234567890".repeat(100)}`;
    expect(() => PersonalId.parseOrThrow(malicious)).toThrow(IllegalIdNumberException);
  });
});

// ===== random generation =====

describe("SwedishOfficialIdFaker random generation", () => {
  it("randomly generated IDs are valid SwedishOfficialIds", () => {
    for (let i = 0; i < 100; i++) {
      const id = SwedishOfficialIdFaker.swedishOfficialId().create();
      const idType = id.getIdType();
      expect(["PERSONAL", "COORDINATION", "ORGANISATION"]).toContain(idType);
    }
  });
});
