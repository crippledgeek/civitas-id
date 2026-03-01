import { describe, expect, it } from "vitest";
import { CoordinationId, OrganisationId, PersonalId } from "../../src/core/swedish-ids.js";
import { InvalidIdNumberError } from "../../src/error/invalid-id-number-error.js";
import { OrganisationForm } from "../../src/format/organisation-form.js";
import { OrganisationNumberType } from "../../src/format/organisation-number-type.js";
import { PnrFormat } from "../../src/format/pnr-format.js";
import { CoordinationIdFaker } from "../../src/testing/faker/coordination-id-faker.js";
import { PersonalIdFaker } from "../../src/testing/faker/personal-id-faker.js";
import { SwedishOrganisationIdFaker } from "../../src/testing/faker/swedish-organisation-id-faker.js";
import { loadCsv, loadCsvWithHeaders } from "../helpers/csv-loader.js";

// ===== CSV fixture tests =====

describe("OrganisationId CSV — extended test data", () => {
  const rows = loadCsvWithHeaders("testorganisationsnummer_extended.csv");

  it.each(rows)("OrganisationId $input valid=$valid", (row) => {
    const expectedValid = row.valid === "true";
    expect(OrganisationId.isValid(row.input as string)).toBe(expectedValid);

    if (expectedValid && row.long_format) {
      const id = OrganisationId.parseOrThrow(row.input as string);
      // CSV long_format is 10-digit with original separator (e.g. "556016-0680" or "121212+1212")
      expect(id.formatted(PnrFormat.SHORT_FORMAT_WITH_SEPARATOR)).toBe(row.long_format);
    }
  });
});

describe("OrganisationId CSV — personal numbers are valid organisation numbers", () => {
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
  it.each(validRows)("$Testpersonnummer is a valid physical-person OrganisationId", (row) => {
    expect(OrganisationId.isValid(row.Testpersonnummer)).toBe(true);
    const orgId = OrganisationId.parseOrThrow(row.Testpersonnummer);
    expect(orgId.isPhysicalPerson()).toBe(true);
  });
});

// ===== Format methods =====

describe("OrganisationId format methods", () => {
  it("should return full organisation number from personal ID conversion", () => {
    const personalId = PersonalIdFaker.personalId().create();
    const orgId = personalId.toOrganisationId();
    const formatted = orgId.formatted(PnrFormat.SHORT_FORMAT_WITH_SEPARATOR);
    const parsed = OrganisationId.parseOrThrow(formatted);
    const formattedLong = OrganisationId.format(formatted, PnrFormat.LONG_FORMAT);
    expect(parsed.longFormat()).toBe(formattedLong);
    expect(parsed.isPhysicalPerson()).toBe(true);
  });

  it("formatting consistency for legal person", () => {
    const orgId = SwedishOrganisationIdFaker.organisationId().create();
    const longFormat = orgId.longFormat();
    const shortFormat = orgId.shortFormat();
    expect(orgId.formatted(PnrFormat.LONG_FORMAT)).toBe(longFormat);
    expect(orgId.formatted(PnrFormat.SHORT_FORMAT)).toBe(shortFormat);
  });

  it("two OrganisationIds from same ID are equal", () => {
    const orgId = SwedishOrganisationIdFaker.organisationId().create();
    const longFormat = orgId.longFormat();
    const shortFormat = orgId.shortFormat();
    const parsedFromLong = OrganisationId.parseOrThrow(longFormat);
    const parsedFromShort = OrganisationId.parseOrThrow(shortFormat);
    expect(parsedFromLong.equals(parsedFromShort)).toBe(true);
  });

  it("isLegalPerson() true for legal person org IDs", () => {
    const orgId = SwedishOrganisationIdFaker.organisationId().createLegalPerson();
    expect(orgId.isLegalPerson()).toBe(true);
    expect(orgId.isPhysicalPerson()).toBe(false);
  });

  it("isPhysicalPerson() true for physical person org IDs", () => {
    const orgId = SwedishOrganisationIdFaker.organisationId().createPhysicalPerson();
    expect(orgId.isPhysicalPerson()).toBe(true);
    expect(orgId.isLegalPerson()).toBe(false);
  });

  it("LONG_FORMAT_WITH_SEPARATOR preserves original minus separator", () => {
    const id = OrganisationId.parseOrThrow("16552100-0009");
    expect(id.formatted(PnrFormat.LONG_FORMAT_WITH_SEPARATOR)).toBe("552100-0009");

    const physicalWithMinus = OrganisationId.parseOrThrow("20240713-2394");
    expect(physicalWithMinus.formatted(PnrFormat.LONG_FORMAT_WITH_SEPARATOR)).toBe("240713-2394");

    const physicalWithPlus = OrganisationId.parseOrThrow("19100101+1236");
    expect(physicalWithPlus.formatted(PnrFormat.LONG_FORMAT_WITH_SEPARATOR)).toBe("100101+1236");
  });

  it("SHORT_FORMAT_WITH_SEPARATOR preserves original separator", () => {
    const id = OrganisationId.parseOrThrow("16552100-0009");
    expect(id.formatted(PnrFormat.SHORT_FORMAT_WITH_SEPARATOR)).toBe("552100-0009");

    const physicalWithMinus = OrganisationId.parseOrThrow("20240713-2394");
    expect(physicalWithMinus.formatted(PnrFormat.SHORT_FORMAT_WITH_SEPARATOR)).toBe("240713-2394");

    const physicalWithPlus = OrganisationId.parseOrThrow("19100101+1236");
    expect(physicalWithPlus.formatted(PnrFormat.SHORT_FORMAT_WITH_SEPARATOR)).toBe("100101+1236");
  });

  it("LONG_FORMAT_WITH_STANDARD_SEPARATOR forces minus", () => {
    const idWithPlus = OrganisationId.parseOrThrow("19100101+1236");
    expect(idWithPlus.formatted(PnrFormat.LONG_FORMAT_WITH_STANDARD_SEPARATOR)).toBe("100101-1236");

    const idWithMinus = OrganisationId.parseOrThrow("20240713-2394");
    expect(idWithMinus.formatted(PnrFormat.LONG_FORMAT_WITH_STANDARD_SEPARATOR)).toBe(
      "240713-2394",
    );

    const legalPerson = OrganisationId.parseOrThrow("16552100-0009");
    expect(legalPerson.formatted(PnrFormat.LONG_FORMAT_WITH_STANDARD_SEPARATOR)).toBe(
      "552100-0009",
    );
  });

  it("SHORT_FORMAT_WITH_STANDARD_SEPARATOR forces minus", () => {
    const idWithPlus = OrganisationId.parseOrThrow("19100101+1236");
    expect(idWithPlus.formatted(PnrFormat.SHORT_FORMAT_WITH_STANDARD_SEPARATOR)).toBe(
      "100101-1236",
    );

    const idWithMinus = OrganisationId.parseOrThrow("20240713-2394");
    expect(idWithMinus.formatted(PnrFormat.SHORT_FORMAT_WITH_STANDARD_SEPARATOR)).toBe(
      "240713-2394",
    );

    const legalPerson = OrganisationId.parseOrThrow("16552100-0009");
    expect(legalPerson.formatted(PnrFormat.SHORT_FORMAT_WITH_STANDARD_SEPARATOR)).toBe(
      "552100-0009",
    );
  });

  it("LONG_FORMAT has no separator (10 digits)", () => {
    const id = OrganisationId.parseOrThrow("16552100-0009");
    expect(id.formatted(PnrFormat.LONG_FORMAT)).toBe("5521000009");

    const physical = OrganisationId.parseOrThrow("20240713-2394");
    expect(physical.formatted(PnrFormat.LONG_FORMAT)).toBe("2407132394");
  });

  it("SHORT_FORMAT has no separator (10 digits)", () => {
    const id = OrganisationId.parseOrThrow("16552100-0009");
    expect(id.formatted(PnrFormat.SHORT_FORMAT)).toBe("5521000009");

    const physical = OrganisationId.parseOrThrow("20240713-2394");
    expect(physical.formatted(PnrFormat.SHORT_FORMAT)).toBe("2407132394");
  });
});

// ===== Parse methods =====

describe("OrganisationId parse methods", () => {
  it("parse() returns OrganisationId for valid input", () => {
    const orgId = SwedishOrganisationIdFaker.organisationId().create();
    const result = OrganisationId.parse(orgId.longFormat());
    expect(result).toBeDefined();
  });

  it("parse() returns undefined for invalid input", () => {
    expect(OrganisationId.parse("invalid")).toBeUndefined();
  });

  it("parse() returns undefined for null", () => {
    expect(OrganisationId.parse(null)).toBeUndefined();
  });

  it("parse() returns present for valid input '556012-3456'", () => {
    const result = OrganisationId.parse("556012-3456");
    expect(result).toBeDefined();
    expect(result?.longFormat()).toBe("5560123456");
  });

  it("parseOrThrow() throws InvalidIdNumberError for invalid input", () => {
    expect(() => OrganisationId.parseOrThrow("invalid789")).toThrow(InvalidIdNumberError);
  });

  it("parseOrThrow() with LEGAL_PERSON type accepts legal persons", () => {
    const orgId = SwedishOrganisationIdFaker.organisationId().createLegalPerson();
    const parsed = OrganisationId.parseOrThrow(
      orgId.longFormat(),
      OrganisationNumberType.LEGAL_PERSON,
    );
    expect(parsed.isLegalPerson()).toBe(true);
  });

  it("parseOrThrow() with PHYSICAL_PERSON type accepts physical persons", () => {
    const personalId = PersonalIdFaker.personalId().create();
    const orgId = personalId.toOrganisationId();
    const parsed = OrganisationId.parseOrThrow(
      orgId.longFormat(),
      OrganisationNumberType.PHYSICAL_PERSON,
    );
    expect(parsed.isPhysicalPerson()).toBe(true);
  });

  it("parseOrThrow() with LEGAL_PERSON type rejects physical persons", () => {
    const personalId = PersonalIdFaker.personalId().create();
    const orgId = personalId.toOrganisationId();
    expect(() =>
      OrganisationId.parseOrThrow(orgId.longFormat(), OrganisationNumberType.LEGAL_PERSON),
    ).toThrow();
  });
});

// ===== Validity =====

describe("OrganisationId validity", () => {
  it("isValid() with LEGAL_PERSON type validates legal persons", () => {
    const orgId = SwedishOrganisationIdFaker.organisationId().createLegalPerson();
    expect(OrganisationId.isValid(orgId.longFormat(), OrganisationNumberType.LEGAL_PERSON)).toBe(
      true,
    );
  });

  it("isValid() with PHYSICAL_PERSON type validates physical persons", () => {
    const personalId = PersonalIdFaker.personalId().create();
    const orgId = personalId.toOrganisationId();
    expect(OrganisationId.isValid(orgId.longFormat(), OrganisationNumberType.PHYSICAL_PERSON)).toBe(
      true,
    );
  });

  it("isValid() returns false for null", () => {
    expect(OrganisationId.isValid(null)).toBe(false);
  });

  it("specific valid organisation numbers", () => {
    expect(OrganisationId.isValid("165521000009")).toBe(true);
    expect(OrganisationId.isValid("16552100-0009")).toBe(true);
    expect(OrganisationId.isValid("SE16552100-0009")).toBe(true);
    expect(OrganisationId.isValid("163521001234")).toBe(true);
    expect(OrganisationId.isValid("165565588141")).toBe(true);
    expect(OrganisationId.isValid("5565588141")).toBe(true);
    expect(OrganisationId.isValid("19120130+9877")).toBe(true);
    expect(OrganisationId.isValid("19111230+0007")).toBe(true);
    expect(OrganisationId.isValid("191112300007")).toBe(true);
    expect(OrganisationId.isValid("SE191112300007")).toBe(true);
  });

  it("isValid() returns false for LEGAL_PERSON type when ID is physical person", () => {
    expect(OrganisationId.isValid("191112300007", OrganisationNumberType.LEGAL_PERSON)).toBe(false);
    expect(() =>
      OrganisationId.parseOrThrow("191112300007", OrganisationNumberType.LEGAL_PERSON),
    ).toThrow(InvalidIdNumberError);
  });

  it("isValid() returns false for PHYSICAL_PERSON type when ID is legal person", () => {
    expect(OrganisationId.isValid("165521000009", OrganisationNumberType.PHYSICAL_PERSON)).toBe(
      false,
    );
    expect(() =>
      OrganisationId.parseOrThrow("165521000009", OrganisationNumberType.PHYSICAL_PERSON),
    ).toThrow(InvalidIdNumberError);
  });

  it("not parseable organisation numbers", () => {
    expect(() => OrganisationId.parseOrThrow("16202100548")).toThrow(InvalidIdNumberError); // too short
    expect(() => OrganisationId.parseOrThrow("19111330+0007")).toThrow(InvalidIdNumberError); // month > 12
  });

  it("isValid() returns false for garbage/short/invalid-prefix inputs", () => {
    expect(OrganisationId.isValid("abc")).toBe(false);
    expect(OrganisationId.isValid("19111230000")).toBe(false);
    expect(OrganisationId.isValid("DK191112300007")).toBe(false);
  });

  it("parseOrThrow() throws for garbage/short/invalid-prefix inputs", () => {
    expect(() => OrganisationId.parseOrThrow("abc")).toThrow(InvalidIdNumberError);
    expect(() => OrganisationId.parseOrThrow("19111230000")).toThrow(InvalidIdNumberError);
    expect(() => OrganisationId.parseOrThrow("DK191112300007")).toThrow(InvalidIdNumberError);
  });
});

// ===== Short/long format equivalence =====

describe("OrganisationId format equivalence", () => {
  it("parses IDs with + symbol (19th century) correctly", () => {
    expect(
      OrganisationId.parseOrThrow("191112300007").equals(
        OrganisationId.parseOrThrow("111230+0007"),
      ),
    ).toBe(true);
    expect(
      OrganisationId.parseOrThrow("191112300007").equals(
        OrganisationId.parseOrThrow("19111230+0007"),
      ),
    ).toBe(true);
    expect(
      OrganisationId.parseOrThrow("188912300004").equals(
        OrganisationId.parseOrThrow("891230+0004"),
      ),
    ).toBe(true);
  });

  it("parses IDs with - symbol or no symbol (20th century) correctly", () => {
    expect(
      OrganisationId.parseOrThrow("201112300007").equals(
        OrganisationId.parseOrThrow("111230-0007"),
      ),
    ).toBe(true);
    expect(
      OrganisationId.parseOrThrow("201112300007").equals(OrganisationId.parseOrThrow("1112300007")),
    ).toBe(true);
    expect(
      OrganisationId.parseOrThrow("193512300009").equals(OrganisationId.parseOrThrow("3512300009")),
    ).toBe(true);
    expect(
      OrganisationId.parseOrThrow("193512300009").equals(
        OrganisationId.parseOrThrow("351230-0009"),
      ),
    ).toBe(true);
  });
});

// ===== from() =====

describe("OrganisationId.from()", () => {
  it("converts PersonalId to OrganisationId", () => {
    const personId = PersonalId.parseOrThrow("202407132394");
    const orgId = OrganisationId.from(personId);
    expect(orgId).toBeDefined();
    expect(orgId.longFormat()).toBe("2407132394");
    expect(orgId.longFormat()).toHaveLength(10);
  });

  it("converts CoordinationId to OrganisationId", () => {
    const coordId = CoordinationId.parseOrThrow("198206822390");
    const orgId = OrganisationId.from(coordId);
    expect(orgId).toBeDefined();
    expect(orgId.isPhysicalPerson()).toBe(true);
  });
});

// ===== getOrganisationForm() =====

describe("OrganisationId.getOrganisationForm()", () => {
  it("returns NONE for physical persons (personal ID)", () => {
    const personalId = PersonalId.parseOrThrow("202407132394");
    const orgId = personalId.toOrganisationId();
    expect(orgId.getOrganisationForm()).toBe(OrganisationForm.NONE);
    expect(orgId.isPhysicalPerson()).toBe(true);
    expect(orgId.getOrganisationForm().code).toBe(0);
  });

  it("returns NONE for physical persons (coordination ID)", () => {
    const coordId = CoordinationId.parseOrThrow("198206822390");
    const orgId = coordId.toOrganisationId();
    expect(orgId.getOrganisationForm()).toBe(OrganisationForm.NONE);
    expect(orgId.isPhysicalPerson()).toBe(true);
  });

  const formCases: Array<[string, string, number]> = [
    ["492000-0140", "AKTIEBOLAG_OVRIGA", 49],
    ["212000-0142", "ENKLA_BOLAG", 21],
    ["222000-0141", "PARTREDERIER", 22],
    ["312000-0140", "HANDELSBOLAG_KOMMANDITBOLAG", 31],
    ["322000-0149", "GRUVBOLAG", 32],
    ["412000-0148", "BANKAKTIEBOLAG", 41],
    ["422000-0147", "FORSAKRINGSAKTIEBOLAG", 42],
    ["432000-0146", "EUROPABOLAG", 43],
    ["512000-0145", "EKONOMISKA_FORENINGAR", 51],
    ["532000-0143", "BOSTADSRATTSFORENINGAR", 53],
    ["542000-0142", "KOOPERATIV_HYRESRATTSFORENING", 54],
    ["552000-0141", "EUROPAKOOPERATIV_EGTS_ERIC", 55],
    ["612000-0143", "IDEELLA_FORENINGAR", 61],
    ["622000-0142", "SAMFALLIGHETER", 62],
    ["632000-0141", "REGISTRERAT_TROSSAMFUND", 63],
    ["712000-0141", "FAMILJESTIFTELSER", 71],
    ["722000-0140", "STIFTELSER_FONDER_OVRIGA", 72],
    ["812000-0149", "STATLIGA_ENHETER", 81],
    ["822000-0148", "KOMMUNER", 82],
    ["832000-0147", "KOMMUNALFORBUND", 83],
    ["842000-0146", "REGIONER", 84],
    ["852000-0145", "ALLMANNA_FORSAKRINGSKASSOR", 85],
    ["872000-0143", "OFFENTLIGA_KORPORATIONER_ANSTALTER", 87],
    ["882000-0142", "HYPOTEKSFORENINGAR", 88],
    ["892000-0141", "REGIONALA_STATLIGA_MYNDIGHETER", 89],
    ["912000-0147", "OSKIFTADE_DODSBON", 91],
    ["922000-0146", "OMSESIDIGA_FORSAKRINGSBOLAG", 92],
    ["932000-0145", "SPARBANKER", 93],
    ["942000-0144", "UNDERSTODSFORENINGAR_FORSAKRINGSFORENINGAR", 94],
    ["952000-0143", "ARBETSLOSHETSKASSOR", 95],
    ["962000-0142", "UTLANDSKA_JURIDISKA_PERSONER", 96],
    ["982000-0140", "OVRIGA_SVENSKA_JURIDISKA_PERSONER", 98],
    ["992000-0149", "JURIDISK_FORM_EJ_UTREDD", 99],
  ];

  it.each(formCases)(
    "getOrganisationForm(%s) = %s (code %i)",
    (orgNumber, expectedName, expectedCode) => {
      const orgId = OrganisationId.parseOrThrow(orgNumber);
      expect(orgId.isLegalPerson()).toBe(true);
      const form = orgId.getOrganisationForm();
      expect(form.name).toBe(expectedName);
      expect(form.code).toBe(expectedCode);
    },
  );

  const unknownCodes: Array<[string, number]> = [
    ["502000-0146", 50],
    ["562000-0140", 56],
    ["702000-0142", 70],
    ["862000-0144", 86],
  ];

  it.each(unknownCodes)("unknown code %i returns JURIDISK_FORM_EJ_UTREDD", (orgNumber) => {
    const orgId = OrganisationId.parseOrThrow(orgNumber);
    const form = orgId.getOrganisationForm();
    expect(form).toBe(OrganisationForm.JURIDISK_FORM_EJ_UTREDD);
    expect(form.code).toBe(99);
  });

  it("works with different input formats (10-digit, 12-digit, with separator)", () => {
    const variants = ["492000-0140", "4920000140", "164920000140", "16492000-0140"];
    for (const variant of variants) {
      const orgId = OrganisationId.parseOrThrow(variant);
      const form = orgId.getOrganisationForm();
      expect(form).toBe(OrganisationForm.AKTIEBOLAG_OVRIGA);
      expect(form.code).toBe(49);
    }
  });

  it("is consistent across multiple calls", () => {
    const orgId = OrganisationId.parseOrThrow("492000-0140");
    expect(orgId.getOrganisationForm()).toBe(orgId.getOrganisationForm());
  });

  it("description is in Swedish", () => {
    const orgId = OrganisationId.parseOrThrow("492000-0140");
    expect(orgId.getOrganisationForm().description).toBe("Övriga aktiebolag");
  });
});

// ===== Optional-style API =====

describe("OrganisationId optional-style API", () => {
  it("parse() chains with optional chaining", () => {
    const formatted =
      OrganisationId.parse("556012-3456")?.formatted(PnrFormat.LONG_FORMAT_WITH_SEPARATOR) ??
      "Invalid";
    expect(formatted).toBe("556012-3456");
  });

  it("parse() filter-like for legal persons", () => {
    const result = OrganisationId.parse("556012-3456");
    const legalOnly = result?.isLegalPerson() ? result : undefined;
    expect(legalOnly).toBeDefined();
  });

  it("parse() filter-like for physical persons", () => {
    const result = OrganisationId.parse("202407132394");
    const physicalOnly = result?.isPhysicalPerson() ? result : undefined;
    expect(physicalOnly).toBeDefined();
  });

  it("parse() map to OrganisationForm (code 55)", () => {
    const form = OrganisationId.parse("556012-3456")?.getOrganisationForm();
    expect(form).toBeDefined();
    expect(form?.code).toBe(55);
  });

  it("parse() map to description", () => {
    const description =
      OrganisationId.parse("492000-0140")?.getOrganisationForm().description ?? "Unknown";
    expect(description).toBe("Övriga aktiebolag");
  });
});

// ===== PersonalId conversion round-trips =====

describe("OrganisationId conversion round-trips", () => {
  it("personalNumberShouldBePrivatePerson", () => {
    const personalId = PersonalIdFaker.personalId().create();
    const orgId = personalId.toOrganisationId();
    expect(orgId.isPhysicalPerson()).toBe(true);
    const convertedPersonalId = PersonalId.parseOrThrow(orgId.longFormat());
    const personOfficialId = orgId.toPersonOfficialId();
    expect(personalId.equals(convertedPersonalId)).toBe(true);
    expect(personOfficialId).toBeDefined();
    expect(() => CoordinationId.parseOrThrow(orgId.longFormat())).toThrow(InvalidIdNumberError);
  });

  it("personalNumberCanBeConvertedToOrganisationNumber", () => {
    const personalId = PersonalIdFaker.personalId().create();
    const orgId = personalId.toOrganisationId();
    const reconvertedOrgId = PersonalId.parseOrThrow(orgId.longFormat()).toOrganisationId();
    expect(orgId.equals(reconvertedOrgId)).toBe(true);
  });

  it("legal person organisation number cannot be parsed as PersonalId or CoordinationId", () => {
    const orgId = SwedishOrganisationIdFaker.organisationId().createLegalPerson();
    expect(orgId.isLegalPerson()).toBe(true);
    expect(() => PersonalId.parseOrThrow(orgId.longFormat())).toThrow(InvalidIdNumberError);
    expect(() => orgId.toPersonOfficialId()).toThrow(InvalidIdNumberError);
    expect(() => CoordinationId.parseOrThrow(orgId.longFormat())).toThrow(InvalidIdNumberError);
  });

  it("coordinationNumberShouldBePrivatePerson", () => {
    const coordId = CoordinationIdFaker.coordinationId().create();
    const orgId = coordId.toOrganisationId();
    expect(orgId.isPhysicalPerson()).toBe(true);
    const convertedCoordId = CoordinationId.parseOrThrow(orgId.longFormat());
    const personOfficialId = orgId.toPersonOfficialId();
    expect(coordId.equals(convertedCoordId)).toBe(true);
    expect(personOfficialId).toBeDefined();
  });

  it("toOrganisationId() on OrganisationId returns equal instance", () => {
    const orgId = SwedishOrganisationIdFaker.organisationId().createLegalPerson();
    const converted = orgId.toOrganisationId();
    expect(orgId.equals(converted)).toBe(true);
  });

  it("getRegistrationDate() returns undefined", () => {
    const orgId = SwedishOrganisationIdFaker.organisationId().createLegalPerson();
    expect(orgId.getRegistrationDate()).toBeUndefined();
  });

  it("getOrganisationType() returns form name for legal person", () => {
    const orgId = SwedishOrganisationIdFaker.organisationId().createLegalPerson();
    const orgType = orgId.getOrganisationType();
    expect(orgType).toBeDefined();
    expect(typeof orgType).toBe("string");
  });

  it("getOrganisationType() returns undefined for physical person", () => {
    const orgId = SwedishOrganisationIdFaker.organisationId().createPhysicalPerson();
    expect(orgId.getOrganisationType()).toBeUndefined();
  });

  it("getCountryCode() returns SE", () => {
    const orgId = SwedishOrganisationIdFaker.organisationId().createLegalPerson();
    expect(orgId.getCountryCode()).toBe("SE");
  });
});
