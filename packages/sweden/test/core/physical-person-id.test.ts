import { LocalDate } from "@deathbycode/civitas-id-core";
import { describe, expect, it } from "vitest";
import type { AbstractPersonId } from "../../src/core/abstract-person-id.js";
import { CoordinationId } from "../../src/core/coordination-id.js";
import { PersonalId } from "../../src/core/personal-id.js";
import { SwedishOfficialId } from "../../src/core/swedish-official-id.js";
import { loadCsvWithHeaders } from "../helpers/csv-loader.js";

// Reference clock for the testpersonnummer_final.csv fixture, calibrated by the
// .NET sibling: the unique date satisfying every (yyyy+age, mm, dd) tuple in the
// fixture is 2025-04-23.
const PERSONNUMMER_FIXTURE_TODAY = LocalDate.of(2025, 4, 23);
const fixtureClock = (): LocalDate => PERSONNUMMER_FIXTURE_TODAY;

describe("PhysicalPersonId (AbstractPersonId base) — fixture-driven fan-out", () => {
  // Read all rows; keep both valid and invalid so the IsValid check is exercised
  // even when we skip downstream assertions for invalid rows.
  type FixtureRow = {
    Testpersonnummer: string;
    Female: string;
    Male: string;
    Adult: string;
    Child: string;
    Age: string;
    Valid: string;
  };
  const rows = loadCsvWithHeaders("testpersonnummer_final.csv") as unknown as FixtureRow[];

  it.each(rows)(
    "PersonnummerFinal $Testpersonnummer (valid=$Valid) — gender + age via AbstractPersonId",
    (row) => {
      const expectedValid = row.Valid.toLowerCase() === "true";
      expect(SwedishOfficialId.isValid(row.Testpersonnummer)).toBe(expectedValid);
      if (!expectedValid) return;

      // Mirror .NET: parse as PersonalId if valid, else fall back to CoordinationId.
      // Route via AbstractPersonId base type — exercises the base-class implementation
      // of getAge/isAdult/isChild/isFemale/isMale rather than the concrete subclass.
      const id: AbstractPersonId = PersonalId.isValid(row.Testpersonnummer)
        ? PersonalId.parseOrThrow(row.Testpersonnummer)
        : CoordinationId.parseOrThrow(row.Testpersonnummer);

      expect(id.isFemale()).toBe(row.Female.toLowerCase() === "true");
      expect(id.isMale()).toBe(row.Male.toLowerCase() === "true");
      expect(id.getAge(fixtureClock)).toBe(Number.parseInt(row.Age, 10));
      expect(id.isAdult(fixtureClock)).toBe(row.Adult.toLowerCase() === "true");
      expect(id.isChild(fixtureClock)).toBe(row.Child.toLowerCase() === "true");
    },
  );
});
