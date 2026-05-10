import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PersonalId } from "../../src/core/personal-id.js";
import { PnrFormat } from "../../src/format/pnr-format.js";

/**
 * Centenarian + separator — Stockholm anchor tests (N5 group)
 *
 * `inferDelimiter()` in `SwedishIdMatcher` uses year-only arithmetic:
 *   age = nowYear - birthYear; return age < 100 ? "-" : "+"
 *
 * When a 12-digit no-separator ID is parsed (century present, no delimiter),
 * `inferDelimiter()` is called to decide the internal separator.
 * The pre-fix code reads `new Date().getUTCFullYear()` which at the UTC/Stockholm
 * year boundary (2024-12-31T23:XX UTC == 2025-01-01 CET) returns 2024, not 2025.
 * For someone born 1925-01-01 this makes `age = 2024 - 1925 = 99` → returns "-"
 * even though Stockholm has already rolled into 2025 where age = 100 → should be "+".
 *
 * Pre-computed: YY=25, MM=01, DD=01, BBB=001, checkDigit=7
 *   base "250101001", Luhn check = 7  →  12-digit no-sep: "192501010017"
 *
 * Test format: LONG_FORMAT_WITH_SEPARATOR returns the internal stored representation
 * (YYYYMMDD+XXXX or YYYYMMDD-XXXX), revealing the inferred separator.
 *
 * Deviation from task spec:
 *   The spec proposed `PersonalIdFaker.createFor(1925, 6, 1)` +
 *   `.longFormatWithSeparator()`. That path routes through `getPossibleFullIdNumber`
 *   (not `inferDelimiter`) and the format method always emits "-". The bug only
 *   manifests on 12-digit no-separator input AND at the UTC/Stockholm year boundary,
 *   not the Stockholm midnight (within-year) boundary the spec described. This
 *   deviation targets the actual bug surface.
 */
describe("Centenarian + separator — Stockholm anchor (N5 group)", () => {
  // 12-digit no-separator ID for born 1925-01-01 with BBB=001
  // Luhn-verified: "250101001" checkDigit=7
  const ID_NO_SEP = "192501010017";

  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("N5a: + separator inferred when Stockholm year is 2025 but UTC year is still 2024", () => {
    // 2024-12-31 23:30 UTC == 2025-01-01 00:30 CET (Stockholm has rolled into 2025).
    // Born 1925-01-01 → Stockholm age = 100 → should use "+".
    // Pre-fix: getUTCFullYear() = 2024 → age = 99 → infers "-" (WRONG).
    vi.setSystemTime(new Date("2024-12-31T23:30:00Z"));
    const id = PersonalId.parseOrThrow(ID_NO_SEP);
    expect(id.formatted(PnrFormat.LONG_FORMAT_WITH_SEPARATOR)).toContain("+");
  });

  it("N5b: - separator inferred one minute before Stockholm midnight on 100th birthday", () => {
    // 2024-12-31 22:59:59 UTC == 2024-12-31 23:59:59 CET. Both UTC and Stockholm
    // are still in 2024 → age = 99 → "-" is correct.
    vi.setSystemTime(new Date("2024-12-31T22:59:59Z"));
    const id = PersonalId.parseOrThrow(ID_NO_SEP);
    expect(id.formatted(PnrFormat.LONG_FORMAT_WITH_SEPARATOR)).toContain("-");
  });
});
