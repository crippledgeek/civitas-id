import { describe, expect, it } from "vitest";
import { CoordinationId } from "../../src/core/coordination-id.js";
import { OrganisationId } from "../../src/core/organisation-id.js";
import { PersonalId } from "../../src/core/personal-id.js";
import { InvalidIdNumberError } from "../../src/error/invalid-id-number-error.js";
import { OrganisationForm } from "../../src/format/organisation-form.js";

// Modern fixtures so round-trip via 10-digit short format preserves century inference
// (today >= 2026, sliding window resolves "00" → 2000).
const VALID_PERSONAL_ID = "200001019801"; // 2000-01-01, female
const VALID_COORDINATION_ID = "200001612399"; // 2000-01-01 (coord day 61), male
const VALID_ORGANISATION_ID_LEGAL = "5560160680"; // legal person — Europabolag

describe("Cross-conversion", () => {
  describe("PersonalId → OrganisationId", () => {
    it("toOrganisationId() returns a physical-person OrganisationId", () => {
      const person = PersonalId.parseOrThrow(VALID_PERSONAL_ID);
      const org = person.toOrganisationId();
      expect(org.isPhysicalPerson()).toBe(true);
      expect(org.getOrganisationForm()).toBe(OrganisationForm.NONE);
    });

    it("toOrganisationId() preserves the short format", () => {
      const person = PersonalId.parseOrThrow(VALID_PERSONAL_ID);
      const org = person.toOrganisationId();
      expect(org.shortFormat()).toBe(person.shortFormat());
    });
  });

  describe("CoordinationId → OrganisationId", () => {
    it("toOrganisationId() returns a physical-person OrganisationId", () => {
      const coord = CoordinationId.parseOrThrow(VALID_COORDINATION_ID);
      const org = coord.toOrganisationId();
      expect(org.isPhysicalPerson()).toBe(true);
      expect(org.getOrganisationForm()).toBe(OrganisationForm.NONE);
    });

    it("toOrganisationId() preserves the short format", () => {
      const coord = CoordinationId.parseOrThrow(VALID_COORDINATION_ID);
      const org = coord.toOrganisationId();
      expect(org.shortFormat()).toBe(coord.shortFormat());
    });
  });

  describe("OrganisationId → PersonOfficialIdBase", () => {
    it("PersonalId round-trip via OrganisationId returns an equal PersonalId", () => {
      const original = PersonalId.parseOrThrow(VALID_PERSONAL_ID);
      const asOrg = original.toOrganisationId();
      const back = asOrg.toPersonOfficialId();
      expect(back).toBeInstanceOf(PersonalId);
      expect(back.equals(original)).toBe(true);
    });

    it("CoordinationId round-trip via OrganisationId returns an equal CoordinationId", () => {
      const original = CoordinationId.parseOrThrow(VALID_COORDINATION_ID);
      const asOrg = original.toOrganisationId();
      const back = asOrg.toPersonOfficialId();
      expect(back).toBeInstanceOf(CoordinationId);
      expect(back.equals(original)).toBe(true);
    });

    it("Legal-person OrganisationId.toPersonOfficialId() throws (no encoded person ID)", () => {
      const org = OrganisationId.parseOrThrow(VALID_ORGANISATION_ID_LEGAL);
      expect(org.isLegalPerson()).toBe(true);
      expect(() => org.toPersonOfficialId()).toThrow(InvalidIdNumberError);
    });
  });
});
