import { LocalDate } from "@deathbycode/civitas-id-core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PersonalIdFaker } from "../../src/testing/faker/personal-id-faker.js";

describe("AbstractPersonId — Stockholm anchor and computeAge", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  describe("Group A — Stockholm timezone resolution", () => {
    it("N1: Stockholm boundary, CEST birthday (23:30Z May-7 → 01:30 CEST May-8)", () => {
      vi.setSystemTime(new Date("2026-05-07T23:30:00Z"));
      const id = PersonalIdFaker.createFor(2008, 5, 8);
      expect(id.isAdult()).toBe(true);
    });

    it("N2: Stockholm boundary, CEST 30min after Stockholm midnight (22:30Z → 00:30 CEST)", () => {
      vi.setSystemTime(new Date("2026-05-07T22:30:00Z"));
      const id = PersonalIdFaker.createFor(2008, 5, 8);
      expect(id.isAdult()).toBe(true);
    });

    it("N3a: DST winter (CET) boundary (23:30Z Jan-7 → 00:30 CET Jan-8)", () => {
      vi.setSystemTime(new Date("2026-01-07T23:30:00Z"));
      const id = PersonalIdFaker.createFor(2008, 1, 8);
      expect(id.isAdult()).toBe(true);
    });

    it("N3f: year boundary — Stockholm crosses to 2026 while UTC is still 2025", () => {
      vi.setSystemTime(new Date("2025-12-31T23:30:00Z"));
      const id = PersonalIdFaker.createFor(2008, 1, 1);
      expect(id.isAdult()).toBe(true);
    });
  });

  describe("Group E — no day-before-birthday rule", () => {
    it("N12: day-before birthday → not adult", () => {
      const id = PersonalIdFaker.createFor(2008, 5, 8);
      const dayBefore: () => LocalDate = () => LocalDate.of(2026, 5, 7);
      expect(id.isAdult(dayBefore)).toBe(false);
    });

    it("N13: on the birthday → adult", () => {
      const id = PersonalIdFaker.createFor(2008, 5, 8);
      const onBirthday: () => LocalDate = () => LocalDate.of(2026, 5, 8);
      expect(id.isAdult(onBirthday)).toBe(true);
    });

    it("N13a: year-boundary birthday transitions correctly", () => {
      const id = PersonalIdFaker.createFor(2008, 1, 1);
      expect(id.isAdult(() => LocalDate.of(2025, 12, 31))).toBe(false);
      expect(id.isAdult(() => LocalDate.of(2026, 1, 1))).toBe(true);
    });

    it("N13b: leap-day day-before guard", () => {
      const id = PersonalIdFaker.createFor(2008, 2, 29);
      expect(id.isAdult(() => LocalDate.of(2026, 2, 27))).toBe(false);
      expect(id.isAdult(() => LocalDate.of(2026, 2, 28))).toBe(true);
    });
  });

  describe("Group F — no §2 Sunday/holiday extension", () => {
    it("N14: 18th birthday on a Sunday (2026-09-20) → adult that Sunday, NOT next Monday", () => {
      const id = PersonalIdFaker.createFor(2008, 9, 20);
      const onSunday: () => LocalDate = () => LocalDate.of(2026, 9, 20);
      expect(id.isAdult(onSunday)).toBe(true);
    });

    it("N14a: public-holiday birthday (juldagen 2026-12-25) → adult that day", () => {
      const id = PersonalIdFaker.createFor(2008, 12, 25);
      expect(id.isAdult(() => LocalDate.of(2026, 12, 25))).toBe(true);
    });
  });

  describe("Group D — leap-day anniversary via Lag §1 (end-to-end)", () => {
    it("N8: born Feb-29, today Feb-28 non-leap → age 18, isAdult", () => {
      const id = PersonalIdFaker.createFor(2008, 2, 29);
      expect(id.getAge(() => LocalDate.of(2026, 2, 28))).toBe(18);
      expect(id.isAdult(() => LocalDate.of(2026, 2, 28))).toBe(true);
    });

    it("N9: born Feb-29, today Feb-27 non-leap → age 17, NOT adult", () => {
      const id = PersonalIdFaker.createFor(2008, 2, 29);
      expect(id.getAge(() => LocalDate.of(2026, 2, 27))).toBe(17);
      expect(id.isAdult(() => LocalDate.of(2026, 2, 27))).toBe(false);
    });

    it("N10: born Feb-29, today Feb-29 leap year → age 20", () => {
      const id = PersonalIdFaker.createFor(2008, 2, 29);
      expect(id.getAge(() => LocalDate.of(2028, 2, 29))).toBe(20);
    });

    it("N11: born Feb-29, today Feb-28 leap year (pre-anniversary) → age 19", () => {
      const id = PersonalIdFaker.createFor(2008, 2, 29);
      expect(id.getAge(() => LocalDate.of(2028, 2, 28))).toBe(19);
    });

    it("N11a: born Feb-29, today Mar-1 non-leap → age 18 (post-anniversary)", () => {
      const id = PersonalIdFaker.createFor(2008, 2, 29);
      expect(id.getAge(() => LocalDate.of(2026, 3, 1))).toBe(18);
    });
  });

  describe("Group H — public API contract", () => {
    it("N17: deterministic clock injection bypasses Stockholm anchor", () => {
      vi.setSystemTime(new Date("2030-01-01T00:00:00Z"));
      const id = PersonalIdFaker.createFor(2008, 5, 8);
      const fixed: () => LocalDate = () => LocalDate.of(2026, 5, 8);
      expect(id.getAge(fixed)).toBe(18);
    });

    it("N16: isAdult and isChild are mutually exclusive at the boundary", () => {
      const id = PersonalIdFaker.createFor(2008, 5, 8);
      const onBirthday: () => LocalDate = () => LocalDate.of(2026, 5, 8);
      expect(id.isAdult(onBirthday)).toBe(true);
      expect(id.isChild(onBirthday)).toBe(false);
    });
  });
});
