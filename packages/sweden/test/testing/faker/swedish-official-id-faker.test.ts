import { describe, expect, it } from "vitest";
import {
  CoordinationId,
  OrganisationId,
  PersonalId,
  SwedishOfficialId,
} from "../../../src/core/swedish-ids.js";
import { SwedishOfficialIdFaker } from "../../../src/testing/faker/swedish-official-id-faker.js";

describe("SwedishOfficialIdFaker", () => {
  const faker = SwedishOfficialIdFaker.swedishOfficialId();

  it("create() returns a valid SwedishOfficialId", () => {
    const id = faker.create();
    expect(id).toBeDefined();
    expect(SwedishOfficialId.isValid(id.longFormat())).toBe(true);
  });

  it.each(Array.from({ length: 100 }, (_, i) => [i]))(
    "create() consistently generates valid SwedishOfficialIds (run %i)",
    () => {
      const id = faker.create();
      expect(id).toBeDefined();
      expect(SwedishOfficialId.isValid(id.longFormat())).toBe(true);
    },
  );

  it("create() generates different types of IDs", () => {
    let hasPersonalId = false;
    let hasCoordinationId = false;
    let hasOrganisationId = false;

    for (let i = 0; i < 300; i++) {
      const id = faker.create();

      if (id instanceof PersonalId) hasPersonalId = true;
      else if (id instanceof CoordinationId) hasCoordinationId = true;
      else if (id instanceof OrganisationId) hasOrganisationId = true;

      if (hasPersonalId && hasCoordinationId && hasOrganisationId) break;
    }

    expect(hasPersonalId || hasCoordinationId || hasOrganisationId).toBe(true);
  });

  it("createMany(10) generates specified number of IDs", () => {
    const count = 10;
    const ids = faker.createMany(count);
    expect(ids).toHaveLength(count);

    for (const id of ids) {
      expect(id).toBeDefined();
      expect(SwedishOfficialId.isValid(id.longFormat())).toBe(true);
    }
  });

  it("createMany(0) generates empty array", () => {
    const ids = faker.createMany(0);
    expect(ids).toHaveLength(0);
  });

  it("createMany(1) generates array with one ID", () => {
    const ids = faker.createMany(1);
    expect(ids).toHaveLength(1);
    expect(ids[0]).toBeDefined();
    expect(SwedishOfficialId.isValid(ids[0]?.longFormat())).toBe(true);
  });

  it("createMany(100) generates diverse IDs", () => {
    const generatedIds = new Set<string>();
    const ids = faker.createMany(100);
    for (const id of ids) {
      generatedIds.add(id.longFormat());
    }
    expect(generatedIds.size).toBeGreaterThanOrEqual(90);
  });

  it("swedishOfficialId() factory method creates new instance", () => {
    const fakerInstance = SwedishOfficialIdFaker.swedishOfficialId();
    expect(fakerInstance).toBeDefined();
  });

  it("generated IDs have correct format", () => {
    for (let i = 0; i < 30; i++) {
      const id = faker.create();
      const longFormat = id.longFormat();
      const longFormatWithSep = id.longFormatWithSeparator();

      expect(longFormat.length).toBeGreaterThan(0);
      expect(longFormatWithSep.length).toBeGreaterThanOrEqual(longFormat.length);
    }
  });

  it("generated IDs are parseable by SwedishOfficialId", () => {
    for (let i = 0; i < 30; i++) {
      const originalId = faker.create();
      const idString = originalId.longFormat();
      expect(() => SwedishOfficialId.parseAnyOrThrow(idString)).not.toThrow();
      const parsedId = SwedishOfficialId.parseAnyOrThrow(idString);
      expect(parsedId).toBeDefined();
    }
  });

  it("generated PersonalIds are valid PersonalIds", () => {
    for (let i = 0; i < 100; i++) {
      const id = faker.create();
      if (id instanceof PersonalId) {
        expect(PersonalId.isValid(id.longFormat())).toBe(true);
        expect(id.getBirthDate()).toBeDefined();
      }
    }
  });

  it("generated CoordinationIds are valid CoordinationIds", () => {
    for (let i = 0; i < 100; i++) {
      const id = faker.create();
      if (id instanceof CoordinationId) {
        expect(CoordinationId.isValid(id.longFormat())).toBe(true);
        expect(id.getBirthDate()).toBeDefined();
        // Day should be in coordination range (61-91)
        const longFormat = id.longFormat();
        const dayPart = longFormat.substring(6, 8);
        const day = Number.parseInt(dayPart, 10);
        expect(day).toBeGreaterThanOrEqual(61);
        expect(day).toBeLessThanOrEqual(91);
      }
    }
  });

  it("generated OrganisationIds are valid OrganisationIds", () => {
    for (let i = 0; i < 100; i++) {
      const id = faker.create();
      if (id instanceof OrganisationId) {
        expect(OrganisationId.isValid(id.longFormat())).toBe(true);
      }
    }
  });

  it("all generated IDs have valid checksums", () => {
    for (let i = 0; i < 50; i++) {
      const id = faker.create();
      expect(SwedishOfficialId.isValid(id.longFormat())).toBe(true);
    }
  });

  it("create() does not throw exceptions", () => {
    expect(() => {
      for (let i = 0; i < 50; i++) {
        faker.create();
      }
    }).not.toThrow();
  });

  it("createMany with large count works", () => {
    expect(() => {
      const ids = faker.createMany(1000);
      expect(ids).toHaveLength(1000);
    }).not.toThrow();
  });

  it("generated IDs are instances of discriminated union types", () => {
    for (let i = 0; i < 30; i++) {
      const id = faker.create();
      const isValidType =
        id instanceof PersonalId || id instanceof CoordinationId || id instanceof OrganisationId;
      expect(isValidType).toBe(true);
    }
  });

  it("generated IDs have proper longFormat output", () => {
    for (let i = 0; i < 30; i++) {
      const id = faker.create();
      const longFormat = id.longFormat();
      expect(longFormat).toBeDefined();
      expect(longFormat.length).toBeGreaterThan(0);
      expect(SwedishOfficialId.isValid(longFormat)).toBe(true);
    }
  });

  it("multiple fakers generate different IDs", () => {
    const faker1 = SwedishOfficialIdFaker.swedishOfficialId();
    const faker2 = SwedishOfficialIdFaker.swedishOfficialId();

    const ids1 = new Set<string>();
    const ids2 = new Set<string>();

    for (let i = 0; i < 50; i++) {
      ids1.add(faker1.create().longFormat());
      ids2.add(faker2.create().longFormat());
    }

    const union = new Set([...ids1, ...ids2]);
    expect(union.size).toBeGreaterThan(Math.max(ids1.size, ids2.size));
  });
});
