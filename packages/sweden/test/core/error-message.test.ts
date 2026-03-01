import { describe, expect, it } from "vitest";
import { ChecksumValidator } from "../../src/core/checksum-validator.js";
import { CoordinationId, OrganisationId, PersonalId } from "../../src/core/swedish-ids.js";
import { PersonOfficialIdBase } from "../../src/core/swedish-ids.js";
import { IllegalIdNumberException } from "../../src/error/illegal-id-number-exception.js";
import { PnrFormat } from "../../src/format/pnr-format.js";

describe("Error Message Consistency", () => {
  it("PersonalId provides consistent error messages", () => {
    const invalidId = "invalid123";
    expect(() => PersonalId.parseOrThrow(invalidId)).toThrow(IllegalIdNumberException);
    let caught: Error | undefined;
    try {
      PersonalId.parseOrThrow(invalidId);
    } catch (e) {
      caught = e as Error;
    }
    expect(caught?.message).toBeTruthy();
    expect(caught?.message).toMatch(/^Invalid personal ID:/);
    expect(caught?.message).toContain(invalidId);
  });

  it("CoordinationId provides consistent error messages", () => {
    const invalidId = "invalid456";
    let caught: Error | undefined;
    try {
      CoordinationId.parseOrThrow(invalidId);
    } catch (e) {
      caught = e as Error;
    }
    expect(caught?.message).toMatch(/^Invalid coordination ID:/);
    expect(caught?.message).toContain(invalidId);
  });

  it("OrganisationId provides consistent error messages", () => {
    const invalidId = "invalid789";
    let caught: Error | undefined;
    try {
      OrganisationId.parseOrThrow(invalidId);
    } catch (e) {
      caught = e as Error;
    }
    expect(caught?.message).toMatch(/^Invalid organisation ID:/);
    expect(caught?.message).toContain(invalidId);
  });

  it("PersonOfficialId.format throws for invalid input", () => {
    const invalidId = "invalidXYZ";
    let caught: Error | undefined;
    try {
      PersonOfficialIdBase.format(invalidId, PnrFormat.LONG_FORMAT);
    } catch (e) {
      caught = e as Error;
    }
    expect(caught?.message).toMatch(/^Invalid person official ID:/);
    expect(caught?.message).toContain(invalidId);
  });

  it("null input provides clear error message", () => {
    let caught: Error | undefined;
    try {
      PersonalId.parseOrThrow(null as unknown as string);
    } catch (e) {
      caught = e as Error;
    }
    expect(caught?.message).toContain("null");
  });

  it("too long input provides clear error message", () => {
    const tooLong = "1".repeat(101);
    let caught: Error | undefined;
    try {
      PersonalId.parseOrThrow(tooLong);
    } catch (e) {
      caught = e as Error;
    }
    expect(caught?.message).toMatch(/^Invalid/);
  });

  it("ChecksumValidator throws for invalid digit characters", () => {
    const invalidInput = "12345678A";
    let caught: Error | undefined;
    try {
      ChecksumValidator.calculateCheckDigit(invalidInput);
    } catch (e) {
      caught = e as Error;
    }
    expect(caught?.message).toBeTruthy();
  });
});
