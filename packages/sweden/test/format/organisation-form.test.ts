import { describe, expect, it } from "vitest";
import { OrganisationForm } from "../../src/format/organisation-form.js";

describe("OrganisationForm", () => {
  describe("fromCode()", () => {
    it("returns correct entry for code 49 (Aktiebolag)", () => {
      const form = OrganisationForm.fromCode(49);
      expect(form).toBeDefined();
      expect(form?.name).toBe("AKTIEBOLAG_OVRIGA");
    });

    it("returns correct entry for code 51 (Ekonomiska föreningar)", () => {
      const form = OrganisationForm.fromCode(51);
      expect(form).toBeDefined();
      expect(form?.name).toBe("EKONOMISKA_FORENINGAR");
    });

    it("returns undefined for unknown code", () => {
      expect(OrganisationForm.fromCode(999)).toBeUndefined();
      expect(OrganisationForm.fromCode(0)).toBeDefined();
    });
  });

  describe("fromOrganisationNumber()", () => {
    it("returns correct form for 10-digit org number starting with 49", () => {
      // 556016-0680 => starts with 55 = AKTIEBOLAG (code 49 would be 49XXXXXX)
      const form = OrganisationForm.fromOrganisationNumber("4900001234");
      expect(form.name).toBe("AKTIEBOLAG_OVRIGA");
    });

    it("returns correct form for 12-digit org number with 16 prefix", () => {
      const form = OrganisationForm.fromOrganisationNumber("164900001234");
      expect(form.name).toBe("AKTIEBOLAG_OVRIGA");
    });

    it("returns JURIDISK_FORM_EJ_UTREDD for unknown form code", () => {
      const form = OrganisationForm.fromOrganisationNumber("1000001234");
      expect(form.name).toBe("JURIDISK_FORM_EJ_UTREDD");
    });

    it("returns JURIDISK_FORM_EJ_UTREDD for invalid length", () => {
      const form = OrganisationForm.fromOrganisationNumber("123");
      expect(form.name).toBe("JURIDISK_FORM_EJ_UTREDD");
    });

    it("returns JURIDISK_FORM_EJ_UTREDD when 12-digit with 16 prefix is too short for form code", () => {
      const form = OrganisationForm.fromOrganisationNumber("16");
      expect(form.name).toBe("JURIDISK_FORM_EJ_UTREDD");
    });

    it("returns JURIDISK_FORM_EJ_UTREDD when form code is non-numeric", () => {
      const form = OrganisationForm.fromOrganisationNumber("AB00001234");
      expect(form.name).toBe("JURIDISK_FORM_EJ_UTREDD");
    });
  });

  describe("well-known forms are defined", () => {
    it("AKTIEBOLAG_OVRIGA exists with code 49", () => {
      expect(OrganisationForm.AKTIEBOLAG_OVRIGA.code).toBe(49);
    });

    it("EKONOMISKA_FORENINGAR exists with code 51", () => {
      expect(OrganisationForm.EKONOMISKA_FORENINGAR.code).toBe(51);
    });

    it("HANDELSBOLAG_KOMMANDITBOLAG exists with code 31", () => {
      expect(OrganisationForm.HANDELSBOLAG_KOMMANDITBOLAG.code).toBe(31);
    });

    it("NONE exists with code 0", () => {
      expect(OrganisationForm.NONE.code).toBe(0);
    });
  });
});
