import { describe, expect, it } from "vitest";
import { ValidationResult } from "../src/validation-result.js";

describe("ValidationResult", () => {
  it("valid() creates a valid result", () => {
    const r = ValidationResult.valid();
    expect(r.isValid()).toBe(true);
    expect(r.isInvalid()).toBe(false);
    expect(r.getErrorMessage()).toBeUndefined();
    expect(r.getErrorCode()).toBeUndefined();
  });

  it("invalid(message) creates invalid result with message", () => {
    const r = ValidationResult.invalid("Invalid ID format");
    expect(r.isValid()).toBe(false);
    expect(r.isInvalid()).toBe(true);
    expect(r.getErrorMessage()).toBe("Invalid ID format");
    expect(r.getErrorCode()).toBeUndefined();
  });

  it("invalid(message, code) creates invalid result with message and code", () => {
    const r = ValidationResult.invalid("Invalid checksum", "ERR_CHECKSUM");
    expect(r.isValid()).toBe(false);
    expect(r.getErrorMessage()).toBe("Invalid checksum");
    expect(r.getErrorCode()).toBe("ERR_CHECKSUM");
  });

  describe("toString", () => {
    it("valid result", () => {
      expect(ValidationResult.valid().toString()).toBe("ValidationResult{valid=true}");
    });

    it("invalid with message only", () => {
      expect(ValidationResult.invalid("Test error").toString()).toBe(
        "ValidationResult{valid=false, errorMessage='Test error'}",
      );
    });

    it("invalid with message and code", () => {
      expect(ValidationResult.invalid("Test error", "TEST_ERR").toString()).toBe(
        "ValidationResult{valid=false, errorMessage='Test error', errorCode='TEST_ERR'}",
      );
    });
  });
});
