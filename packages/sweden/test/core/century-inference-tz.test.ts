import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PersonalId } from "../../src/core/personal-id.js";

/**
 * Century inference — Stockholm anchor tests (N6 group)
 *
 * The 2-digit-year century rollover in getPossibleFullIdNumber uses
 * `nowYear` to decide whether `century + YY` falls in the future.
 * At the UTC year-boundary (2025-12-31T23:30Z), UTC year is 2025 but
 * Stockholm civil year is 2026. For a "26" 2-digit year:
 *
 *   UTC path:      century=2000, raw=2026 > 2025 → subtract 100 → 1926  (WRONG)
 *   Stockholm path: century=2000, raw=2026 > 2026 → no  → stays 2026   (CORRECT)
 *
 * The pre-computed short form "260115-0010" has checksum verified via Luhn.
 * Both "19260115-0010" and "20260115-0010" pass Luhn and date validation;
 * only the century inference decides which is returned.
 */
describe("Century inference — Stockholm anchor (N6 group)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("N6a: short-form '26…' resolves to 2026 when Stockholm year is 2026 (UTC still 2025)", () => {
    // 2025-12-31 23:30 UTC == 2026-01-01 00:30 CET. Stockholm has rolled
    // into 2026. A '26' 2-digit year must resolve to 2026, not 1926.
    vi.setSystemTime(new Date("2025-12-31T23:30:00Z"));

    // Pre-computed: YYMMDDBBBC = 260115001, checkDigit=0
    // Short form "260115-0010" is valid for both 1926 and 2026 – only
    // century inference determines which full year is chosen.
    const parsed = PersonalId.parseOrThrow("260115-0010");
    expect(parsed.getBirthDate().year).toBe(2026);
  });

  it("N6b: short-form '26…' resolves to 1926 when Stockholm year is 2025 (well before boundary)", () => {
    // Mid-2025: Stockholm year is 2025, so '26' is in the future → 1926.
    vi.setSystemTime(new Date("2025-06-15T12:00:00Z"));

    const parsed = PersonalId.parseOrThrow("260115-0010");
    expect(parsed.getBirthDate().year).toBe(1926);
  });
});
