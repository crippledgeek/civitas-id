import { describe, expect, it } from "vitest";
import { LocalDate } from "@deathbycode/civitas-id-core";
import { CoordinationId } from "../../../src/core/coordination-id.js";
import { OrganisationId } from "../../../src/core/organisation-id.js";
import { PersonalId } from "../../../src/core/personal-id.js";
import { CoordinationIdFaker } from "../../../src/testing/faker/coordination-id-faker.js";
import { PersonalIdFaker } from "../../../src/testing/faker/personal-id-faker.js";
import { SwedishOfficialIdFaker } from "../../../src/testing/faker/swedish-official-id-faker.js";
import { SwedishOrganisationIdFaker } from "../../../src/testing/faker/swedish-organisation-id-faker.js";

const ITERATIONS = 1000;

describe("Faker invariants — generated outputs always pass validation", () => {
  it("PersonalIdFaker.create() — 1000 iterations all produce valid PersonalIds", () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const id = PersonalIdFaker.create();
      expect(PersonalId.isValid(id.longFormat())).toBe(true);
    }
  });

  it("PersonalIdFaker.createMale() — 1000 iterations all male", () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const id = PersonalIdFaker.createMale();
      expect(id.isMale()).toBe(true);
      expect(id.isFemale()).toBe(false);
    }
  });

  it("PersonalIdFaker.createFemale() — 1000 iterations all female", () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const id = PersonalIdFaker.createFemale();
      expect(id.isFemale()).toBe(true);
      expect(id.isMale()).toBe(false);
    }
  });

  it("CoordinationIdFaker.create() — 1000 iterations all produce valid CoordinationIds", () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const id = CoordinationIdFaker.create();
      expect(CoordinationId.isValid(id.longFormat())).toBe(true);
    }
  });

  it("SwedishOrganisationIdFaker.create() — 1000 iterations all produce valid OrganisationIds", () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const id = SwedishOrganisationIdFaker.create();
      expect(OrganisationId.isValid(id.longFormat())).toBe(true);
    }
  });

  it("SwedishOfficialIdFaker.create() — 1000 iterations all produce valid Swedish IDs of one of three types", () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const id = SwedishOfficialIdFaker.create();
      const long = id.longFormat();
      // Every result must be valid as at least one of the three subtypes.
      const valid =
        PersonalId.isValid(long) ||
        CoordinationId.isValid(long) ||
        OrganisationId.isValid(long);
      expect(valid).toBe(true);
    }
  });

  it("PersonalIdFaker.createFor — 1000 iterations preserve the supplied birth date", () => {
    for (let i = 0; i < ITERATIONS; i++) {
      // Sample a stable random valid date in [1950, 2010].
      const year = 1950 + (i % 60);
      const month = 1 + (i % 12);
      const day = 1 + (i % 28); // safe day range for any month
      const id = PersonalIdFaker.createFor(year, month, day);
      const birth = id.getBirthDate();
      expect(birth.year).toBe(year);
      expect(birth.month).toBe(month);
      expect(birth.day).toBe(day);
    }
  });

  it("CoordinationIdFaker.createFor — 1000 iterations preserve the supplied birth date", () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const year = 1950 + (i % 60);
      const month = 1 + (i % 12);
      const day = 1 + (i % 28);
      const id = CoordinationIdFaker.create(LocalDate.of(year, month, day));
      const birth = id.getBirthDate();
      expect(birth.year).toBe(year);
      expect(birth.month).toBe(month);
      expect(birth.day).toBe(day);
    }
  });
});
