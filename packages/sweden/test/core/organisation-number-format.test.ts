import { describe, expect, it } from "vitest";
import { OrganisationId } from "../../src/core/swedish-ids.js";
import { PnrFormat } from "../../src/format/pnr-format.js";

/**
 * Tests to verify that organisation numbers always output in official 10-digit format,
 * regardless of whether input was 10-digit or 12-digit.
 *
 * Important: 12-digit organisation numbers (16NNNNNNNNNN) are NOT an official
 * Swedish standard. They are accepted for legacy compatibility but always normalized
 * to the official 10-digit format on output.
 */
describe("Organisation Number Format — 12-digit input, 10-digit output", () => {
  it("10-digit input should output 10-digit longFormat", () => {
    const org = OrganisationId.parseOrThrow("556012-3456");
    const longFormat = org.longFormat();
    expect(longFormat).toBe("5560123456");
    expect(longFormat).toHaveLength(10);
  });

  it("12-digit input should output 10-digit longFormat (not 12)", () => {
    const org = OrganisationId.parseOrThrow("165560123456");
    const longFormat = org.longFormat();
    expect(longFormat).toBe("5560123456");
    expect(longFormat).toHaveLength(10);
    expect(longFormat.startsWith("16")).toBe(false);
  });

  it("10-digit input should output 10-digit longFormatWithSeparator", () => {
    const org = OrganisationId.parseOrThrow("556012-3456");
    const formatted = org.longFormatWithSeparator();
    expect(formatted).toBe("556012-3456");
    expect(formatted).toHaveLength(11);
  });

  it("12-digit input should output 10-digit longFormatWithSeparator (not 12)", () => {
    const org = OrganisationId.parseOrThrow("165560123456");
    const formatted = org.longFormatWithSeparator();
    expect(formatted).toBe("556012-3456");
    expect(formatted).toHaveLength(11);
    expect(formatted.startsWith("16")).toBe(false);
  });

  it("12-digit and 10-digit inputs should produce identical outputs", () => {
    const org10 = OrganisationId.parseOrThrow("556012-3456");
    const org12 = OrganisationId.parseOrThrow("165560123456");
    expect(org10.longFormat()).toBe(org12.longFormat());
    expect(org10.longFormatWithSeparator()).toBe(org12.longFormatWithSeparator());
    expect(org10.shortFormat()).toBe(org12.shortFormat());
    expect(org10.shortFormatWithSeparator()).toBe(org12.shortFormatWithSeparator());
  });

  it("12-digit input should output 10-digit with all PnrFormat options", () => {
    const org = OrganisationId.parseOrThrow("165560123456");

    const longFormat = org.formatted(PnrFormat.LONG_FORMAT);
    expect(longFormat).toBe("5560123456");
    expect(longFormat).toHaveLength(10);

    const longSep = org.formatted(PnrFormat.LONG_FORMAT_WITH_STANDARD_SEPARATOR);
    expect(longSep).toBe("556012-3456");
    expect(longSep).toHaveLength(11);

    const shortFormat = org.formatted(PnrFormat.SHORT_FORMAT);
    expect(shortFormat).toBe("5560123456");
    expect(shortFormat).toHaveLength(10);

    const shortSep = org.formatted(PnrFormat.SHORT_FORMAT_WITH_STANDARD_SEPARATOR);
    expect(shortSep).toBe("556012-3456");
    expect(shortSep).toHaveLength(11);
  });

  it("toString() should return 10-digit format, never 12-digit", () => {
    const org10 = OrganisationId.parseOrThrow("556012-3456");
    const org12 = OrganisationId.parseOrThrow("165560123456");
    expect(org10.toString()).toBe("5560123456");
    expect(org12.toString()).toBe("5560123456");
    expect(org10.toString()).toHaveLength(10);
    expect(org12.toString()).toHaveLength(10);
  });

  it("equality: 12-digit and 10-digit representations should be equal", () => {
    const org10 = OrganisationId.parseOrThrow("556012-3456");
    const org12 = OrganisationId.parseOrThrow("165560123456");
    expect(org10.equals(org12)).toBe(true);
  });

  it("multiple 12-digit inputs should all normalize to same 10-digit output", () => {
    const org1 = OrganisationId.parseOrThrow("165560123456");
    const org2 = OrganisationId.parseOrThrow("16556012-3456");
    const org3 = OrganisationId.parseOrThrow("556012-3456");
    expect(org1.longFormat()).toBe("5560123456");
    expect(org2.longFormat()).toBe("5560123456");
    expect(org3.longFormat()).toBe("5560123456");
    expect(org1.equals(org2)).toBe(true);
    expect(org2.equals(org3)).toBe(true);
  });

  it("static format method should output 10-digit regardless of input format", () => {
    const formatted12 = OrganisationId.format("165560123456", PnrFormat.LONG_FORMAT);
    const formatted10 = OrganisationId.format("556012-3456", PnrFormat.LONG_FORMAT);
    expect(formatted12).toBe("5560123456");
    expect(formatted10).toBe("5560123456");
    expect(formatted12).toHaveLength(10);
    expect(formatted10).toHaveLength(10);
  });

  it("real organisation numbers: 12-digit input should output 10-digit", () => {
    const testCases = ["165560123456", "165565588141"];
    for (const input of testCases) {
      if (OrganisationId.isValid(input)) {
        const org = OrganisationId.parseOrThrow(input);
        const output = org.longFormat();
        expect(output).toHaveLength(10);
        expect(output.startsWith("16")).toBe(false);
      }
    }
  });
});
