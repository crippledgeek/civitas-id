import { describe, expect, it } from "vitest";
import { ValidationResult } from "../src/validation-result.js";

describe("ValidationResult", () => {
  it("valid() creates a valid result", () => {
    const r = ValidationResult.valid();
    expect(r.valid).toBe(true);
    expect(r.valid).not.toBe(false);
  });

  it("invalid(message) creates invalid result with message", () => {
    const r = ValidationResult.invalid("Invalid ID format");
    expect(r.valid).toBe(false);
    if (!r.valid) {
      expect(r.errorMessage).toBe("Invalid ID format");
      expect(r.errorCode).toBeUndefined();
    }
  });

  it("invalid(message, code) creates invalid result with message and code", () => {
    const r = ValidationResult.invalid("Invalid checksum", "ERR_CHECKSUM");
    expect(r.valid).toBe(false);
    if (!r.valid) {
      expect(r.errorMessage).toBe("Invalid checksum");
      expect(r.errorCode).toBe("ERR_CHECKSUM");
    }
  });

  describe("toString", () => {
    it("valid result", () => {
      expect(ValidationResult.toString(ValidationResult.valid())).toBe(
        "ValidationResult{valid=true}",
      );
    });

    it("invalid with message only", () => {
      expect(ValidationResult.toString(ValidationResult.invalid("Test error"))).toBe(
        "ValidationResult{valid=false, errorMessage='Test error'}",
      );
    });

    it("invalid with message and code", () => {
      expect(ValidationResult.toString(ValidationResult.invalid("Test error", "TEST_ERR"))).toBe(
        "ValidationResult{valid=false, errorMessage='Test error', errorCode='TEST_ERR'}",
      );
    });
  });
});
