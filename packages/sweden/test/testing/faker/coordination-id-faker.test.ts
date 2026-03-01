import { LocalDate } from "@civitas-id/core";
import { describe, expect, it } from "vitest";
import { CoordinationId } from "../../../src/core/swedish-ids.js";
import { CoordinationIdFaker } from "../../../src/testing/faker/coordination-id-faker.js";

describe("CoordinationIdFaker", () => {
  const faker = CoordinationIdFaker;

  it("create() returns a valid CoordinationId", () => {
    const id = faker.create();
    expect(id).toBeDefined();
    expect(CoordinationId.isValid(id.longFormat())).toBe(true);
  });

  it.each(Array.from({ length: 50 }, (_, i) => [i]))(
    "create() consistently generates valid CoordinationIds (run %i)",
    () => {
      const id = faker.create();
      expect(id).toBeDefined();
      expect(CoordinationId.isValid(id.longFormat())).toBe(true);
      expect(id.getBirthDate()).toBeDefined();
    },
  );

  it("create(LocalDate) generates CoordinationId with specific birthdate", () => {
    const birthDate = LocalDate.of(1990, 5, 15);
    const id = faker.create(birthDate);
    expect(id).toBeDefined();
    expect(CoordinationId.isValid(id.longFormat())).toBe(true);
    expect(id.getBirthDate().equals(birthDate)).toBe(true);
  });

  it("createFor(year, month, day) generates CoordinationId with specific date", () => {
    const id = faker.createFor(1985, 12, 25);
    expect(id).toBeDefined();
    expect(CoordinationId.isValid(id.longFormat())).toBe(true);
    expect(id.getBirthDate().equals(LocalDate.of(1985, 12, 25))).toBe(true);
  });

  it("generated CoordinationId has day + 60", () => {
    const birthDate = LocalDate.of(1990, 5, 15);
    const id = faker.create(birthDate);
    const longFormat = id.longFormat();
    const dayPart = longFormat.substring(6, 8);
    const dayValue = Number.parseInt(dayPart, 10);
    expect(dayValue).toBe(15 + 60);
  });

  it("createMale() generates male CoordinationId", () => {
    const id = faker.createMale();
    expect(id).toBeDefined();
    expect(CoordinationId.isValid(id.longFormat())).toBe(true);
    expect(id.isMale()).toBe(true);
    expect(id.isFemale()).toBe(false);
  });

  it.each(Array.from({ length: 20 }, (_, i) => [i]))(
    "createMale() consistently generates male CoordinationIds (run %i)",
    () => {
      const id = faker.createMale();
      expect(id.isMale()).toBe(true);
      expect(id.isFemale()).toBe(false);
    },
  );

  it("createFemale() generates female CoordinationId", () => {
    const id = faker.createFemale();
    expect(id).toBeDefined();
    expect(CoordinationId.isValid(id.longFormat())).toBe(true);
    expect(id.isFemale()).toBe(true);
    expect(id.isMale()).toBe(false);
  });

  it.each(Array.from({ length: 20 }, (_, i) => [i]))(
    "createFemale() consistently generates female CoordinationIds (run %i)",
    () => {
      const id = faker.createFemale();
      expect(id.isFemale()).toBe(true);
      expect(id.isMale()).toBe(false);
    },
  );

  it("createCentenarian() generates CoordinationId for person 100+ years old", () => {
    const id = faker.createCentenarian();
    expect(id).toBeDefined();
    expect(CoordinationId.isValid(id.longFormat())).toBe(true);
    const age = id.getAge();
    expect(age).toBeGreaterThanOrEqual(100);
    expect(age).toBeLessThanOrEqual(110);
  });

  it.each(Array.from({ length: 10 }, (_, i) => [i]))(
    "createCentenarian() consistently generates valid centenarian IDs (run %i)",
    () => {
      const id = faker.createCentenarian();
      expect(id.getAge()).toBeGreaterThanOrEqual(100);
      expect(CoordinationId.isValid(id.longFormat())).toBe(true);
    },
  );

  it("getCountryCode() returns SE", () => {
    expect(faker.getCountryCode()).toBe("SE");
  });

  it("create() generates diverse CoordinationIds", () => {
    const generatedIds = new Set<string>();
    for (let i = 0; i < 100; i++) {
      const id = faker.create();
      generatedIds.add(id.longFormat());
    }
    expect(generatedIds.size).toBeGreaterThanOrEqual(90);
  });

  it("generated CoordinationId has correct format", () => {
    const id = faker.create();
    const longFormat = id.longFormat();
    expect(longFormat).toHaveLength(12);
    const longFormatWithSep = id.longFormatWithSeparator();
    expect(longFormatWithSep).toHaveLength(13);
  });

  it("generated CoordinationId is parseable", () => {
    const originalId = faker.create();
    const idString = originalId.longFormat();
    const parsedId = CoordinationId.parseOrThrow(idString);
    expect(originalId.equals(parsedId)).toBe(true);
  });

  it("create() with leap year date works correctly", () => {
    const leapDay = LocalDate.of(2000, 2, 29);
    const id = faker.create(leapDay);
    expect(id).toBeDefined();
    expect(CoordinationId.isValid(id.longFormat())).toBe(true);
    expect(id.getBirthDate().equals(leapDay)).toBe(true);
    // Day should be 29 + 60 = 89
    const longFormat = id.longFormat();
    const dayPart = longFormat.substring(6, 8);
    expect(dayPart).toBe("89");
  });

  it("create() with recent date uses minus separator", () => {
    const now = LocalDate.now();
    const recentDate = LocalDate.of(now.year - 30, now.month, 1);
    const id = faker.create(recentDate);
    const longFormatWithSep = id.longFormatWithSeparator();
    expect(longFormatWithSep).toContain("-");
  });

  it("generated CoordinationIds have valid checksums", () => {
    for (let i = 0; i < 20; i++) {
      const id = faker.create();
      expect(CoordinationId.isValid(id.longFormat())).toBe(true);
    }
  });

  it("create() handles dates from different decades", () => {
    const date1970s = LocalDate.of(1975, 6, 15);
    const date1980s = LocalDate.of(1985, 6, 15);
    const date1990s = LocalDate.of(1995, 6, 15);
    const date2000s = LocalDate.of(2005, 6, 15);
    const date2010s = LocalDate.of(2015, 6, 15);

    const id1 = faker.create(date1970s);
    const id2 = faker.create(date1980s);
    const id3 = faker.create(date1990s);
    const id4 = faker.create(date2000s);
    const id5 = faker.create(date2010s);

    expect(CoordinationId.isValid(id1.longFormat())).toBe(true);
    expect(CoordinationId.isValid(id2.longFormat())).toBe(true);
    expect(CoordinationId.isValid(id3.longFormat())).toBe(true);
    expect(CoordinationId.isValid(id4.longFormat())).toBe(true);
    expect(CoordinationId.isValid(id5.longFormat())).toBe(true);

    expect(id1.getBirthDate().equals(date1970s)).toBe(true);
    expect(id2.getBirthDate().equals(date1980s)).toBe(true);
    expect(id3.getBirthDate().equals(date1990s)).toBe(true);
    expect(id4.getBirthDate().equals(date2000s)).toBe(true);
    expect(id5.getBirthDate().equals(date2010s)).toBe(true);
  });

  it("generated male and female IDs are correctly gendered", () => {
    let maleCount = 0;
    let femaleCount = 0;

    for (let i = 0; i < 50; i++) {
      const maleId = faker.createMale();
      const femaleId = faker.createFemale();

      if (maleId.isMale()) maleCount++;
      if (femaleId.isFemale()) femaleCount++;
    }

    expect(maleCount).toBe(50);
    expect(femaleCount).toBe(50);
  });

  it("create() with edge case dates works", () => {
    // First day of year (day = 1, coordination day = 61)
    const firstDay = LocalDate.of(2000, 1, 1);
    const id1 = faker.create(firstDay);
    expect(CoordinationId.isValid(id1.longFormat())).toBe(true);
    expect(id1.longFormat()).toContain("0161");

    // Last day of year (day = 31, coordination day = 91)
    const lastDay = LocalDate.of(2000, 12, 31);
    const id2 = faker.create(lastDay);
    expect(CoordinationId.isValid(id2.longFormat())).toBe(true);
    expect(id2.longFormat()).toContain("1291");

    // Mid-year (day = 15, coordination day = 75)
    const midYear = LocalDate.of(2000, 6, 15);
    const id3 = faker.create(midYear);
    expect(CoordinationId.isValid(id3.longFormat())).toBe(true);
    expect(id3.longFormat()).toContain("0675");
  });

  it("createFor() throws on invalid date", () => {
    expect(() => faker.createFor(2000, 13, 1)).toThrow();
    expect(() => faker.createFor(2000, 2, 30)).toThrow();
  });

  it("coordination day is always in valid range (61-91)", () => {
    for (let i = 0; i < 50; i++) {
      const id = faker.create();
      const longFormat = id.longFormat();
      const dayPart = longFormat.substring(6, 8);
      const coordinationDay = Number.parseInt(dayPart, 10);
      expect(coordinationDay).toBeGreaterThanOrEqual(61);
      expect(coordinationDay).toBeLessThanOrEqual(91);
    }
  });
});
