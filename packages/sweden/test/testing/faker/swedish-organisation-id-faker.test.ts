import { LocalDate } from "@civitas-id/core";
import { describe, expect, it } from "vitest";
import { OrganisationId } from "../../../src/core/swedish-ids.js";
import { OrganisationNumberType } from "../../../src/format/organisation-number-type.js";
import { SwedishOrganisationIdFaker } from "../../../src/testing/faker/swedish-organisation-id-faker.js";

describe("SwedishOrganisationIdFaker", () => {
  const faker = SwedishOrganisationIdFaker.organisationId();

  it("create() returns a valid OrganisationId", () => {
    const id = faker.create();
    expect(id).toBeDefined();
    expect(OrganisationId.isValid(id.longFormat())).toBe(true);
  });

  it.each(Array.from({ length: 50 }, (_, i) => [i]))(
    "create() consistently generates valid OrganisationIds (run %i)",
    () => {
      const id = faker.create();
      expect(id).toBeDefined();
      expect(OrganisationId.isValid(id.longFormat())).toBe(true);
    },
  );

  it("create() generates legal person by default", () => {
    const id = faker.create();
    expect(id.isLegalPerson()).toBe(true);
    expect(id.isPhysicalPerson()).toBe(false);
  });

  it("createLegalPerson() generates legal person OrganisationId", () => {
    const id = faker.createLegalPerson();
    expect(id).toBeDefined();
    expect(OrganisationId.isValid(id.longFormat())).toBe(true);
    expect(id.isLegalPerson()).toBe(true);
    expect(id.isPhysicalPerson()).toBe(false);
  });

  it.each(Array.from({ length: 20 }, (_, i) => [i]))(
    "createLegalPerson() consistently generates legal persons (run %i)",
    () => {
      const id = faker.createLegalPerson();
      expect(id.isLegalPerson()).toBe(true);
      expect(id.isPhysicalPerson()).toBe(false);
    },
  );

  it("createPhysicalPerson() generates physical person OrganisationId", () => {
    const id = faker.createPhysicalPerson();
    expect(id).toBeDefined();
    expect(OrganisationId.isValid(id.longFormat())).toBe(true);
    expect(id.isPhysicalPerson()).toBe(true);
    expect(id.isLegalPerson()).toBe(false);
  });

  it.each(Array.from({ length: 20 }, (_, i) => [i]))(
    "createPhysicalPerson() consistently generates physical persons (run %i)",
    () => {
      const id = faker.createPhysicalPerson();
      expect(id.isPhysicalPerson()).toBe(true);
      expect(id.isLegalPerson()).toBe(false);
    },
  );

  it("create(LocalDate) generates OrganisationId with specific date", () => {
    const registrationDate = LocalDate.of(2020, 1, 15);
    const id = faker.create(registrationDate);
    expect(id).toBeDefined();
    expect(OrganisationId.isValid(id.longFormat())).toBe(true);
  });

  it("createFor(year, month, day) generates OrganisationId with specific date", () => {
    const id = faker.createFor(2020, 1, 15);
    expect(id).toBeDefined();
    expect(OrganisationId.isValid(id.longFormat())).toBe(true);
  });

  it("getCountryCode() returns SE", () => {
    expect(faker.getCountryCode()).toBe("SE");
  });

  it("organisationId() factory method creates new instance", () => {
    const fakerInstance = SwedishOrganisationIdFaker.organisationId();
    expect(fakerInstance).toBeDefined();
    expect(fakerInstance).not.toBe(faker);
  });

  it("create() generates diverse OrganisationIds", () => {
    const generatedIds = new Set<string>();
    for (let i = 0; i < 100; i++) {
      const id = faker.create();
      generatedIds.add(id.longFormat());
    }
    expect(generatedIds.size).toBeGreaterThanOrEqual(90);
  });

  it("generated OrganisationId has correct format", () => {
    const id = faker.create();
    const longFormat = id.longFormat();
    const longFormatWithSep = id.longFormatWithSeparator();

    expect(longFormat.length).toBeGreaterThan(0);
    expect(longFormatWithSep.length).toBeGreaterThanOrEqual(longFormat.length);
  });

  it("generated OrganisationId is parseable", () => {
    const originalId = faker.create();
    const idString = originalId.longFormat();
    const parsedId = OrganisationId.parseOrThrow(idString, OrganisationNumberType.LEGAL_PERSON);
    expect(originalId.equals(parsedId)).toBe(true);
  });

  it("generated OrganisationIds have valid checksums", () => {
    for (let i = 0; i < 20; i++) {
      const id = faker.create();
      expect(OrganisationId.isValid(id.longFormat())).toBe(true);
    }
  });

  it("legal person is valid and recognized as legal person", () => {
    for (let i = 0; i < 20; i++) {
      const id = faker.createLegalPerson();
      expect(OrganisationId.isValid(id.longFormat())).toBe(true);
      expect(id.isLegalPerson()).toBe(true);
      expect(id.isPhysicalPerson()).toBe(false);
    }
  });

  it("physical person is convertible from PersonalId", () => {
    const id = faker.createPhysicalPerson();
    expect(id).toBeDefined();
    expect(id.isPhysicalPerson()).toBe(true);
    expect(() => id.toPersonOfficialId()).not.toThrow();
  });

  it("legal person and physical person are distinguishable", () => {
    const legalPerson = faker.createLegalPerson();
    const physicalPerson = faker.createPhysicalPerson();

    expect(legalPerson.isLegalPerson()).toBe(true);
    expect(legalPerson.isPhysicalPerson()).toBe(false);

    expect(physicalPerson.isPhysicalPerson()).toBe(true);
    expect(physicalPerson.isLegalPerson()).toBe(false);
  });

  it("generated legal persons have organisation forms", () => {
    for (let i = 0; i < 10; i++) {
      const id = faker.createLegalPerson();
      expect(id.getOrganisationForm()).toBeDefined();
    }
  });

  it("create with different dates works", () => {
    const date1 = LocalDate.of(2020, 1, 1);
    const date2 = LocalDate.of(2020, 6, 15);
    const date3 = LocalDate.of(2020, 12, 31);

    const id1 = faker.create(date1);
    const id2 = faker.create(date2);
    const id3 = faker.create(date3);

    expect(OrganisationId.isValid(id1.longFormat())).toBe(true);
    expect(OrganisationId.isValid(id2.longFormat())).toBe(true);
    expect(OrganisationId.isValid(id3.longFormat())).toBe(true);
  });

  it("legal and physical persons are distinguishable by type", () => {
    for (let i = 0; i < 10; i++) {
      const legalPerson = faker.createLegalPerson();
      const physicalPerson = faker.createPhysicalPerson();

      expect(legalPerson.isLegalPerson()).toBe(true);
      expect(legalPerson.isPhysicalPerson()).toBe(false);

      expect(physicalPerson.isPhysicalPerson()).toBe(true);
      expect(physicalPerson.isLegalPerson()).toBe(false);
    }
  });

  it("generated IDs are valid for longFormat output", () => {
    for (let i = 0; i < 20; i++) {
      const id = faker.create();
      expect(OrganisationId.isValid(id.longFormat())).toBe(true);
    }
  });

  it("createLegalPerson never creates physical persons", () => {
    for (let i = 0; i < 50; i++) {
      const id = faker.createLegalPerson();
      expect(id.isLegalPerson()).toBe(true);
      expect(id.isPhysicalPerson()).toBe(false);
    }
  });

  it("createFor() throws on invalid date", () => {
    expect(() => faker.createFor(2000, 13, 1)).toThrow();
    expect(() => faker.createFor(2000, 2, 30)).toThrow();
  });

  it("createPhysicalPerson never creates legal persons", () => {
    for (let i = 0; i < 50; i++) {
      const id = faker.createPhysicalPerson();
      expect(id.isPhysicalPerson()).toBe(true);
      expect(id.isLegalPerson()).toBe(false);
    }
  });
});
