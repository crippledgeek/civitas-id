import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { todayInSweden } from "../../src/internal/sweden-clock.js";

describe("todayInSweden", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns the Stockholm calendar date when UTC has not yet rolled over (CEST summer)", () => {
    // 2026-05-07 23:30 UTC == 2026-05-08 01:30 CEST.
    vi.setSystemTime(new Date("2026-05-07T23:30:00Z"));
    const today = todayInSweden();
    expect(today.year).toBe(2026);
    expect(today.month).toBe(5);
    expect(today.day).toBe(8);
  });

  it("returns the Stockholm calendar date when UTC has not yet rolled over (CET winter)", () => {
    // 2026-01-07 23:30 UTC == 2026-01-08 00:30 CET.
    vi.setSystemTime(new Date("2026-01-07T23:30:00Z"));
    const today = todayInSweden();
    expect(today.year).toBe(2026);
    expect(today.month).toBe(1);
    expect(today.day).toBe(8);
  });

  it("crosses the year boundary on Stockholm midnight, not UTC midnight", () => {
    // 2025-12-31 23:30 UTC == 2026-01-01 00:30 CET.
    vi.setSystemTime(new Date("2025-12-31T23:30:00Z"));
    const today = todayInSweden();
    expect(today.year).toBe(2026);
    expect(today.month).toBe(1);
    expect(today.day).toBe(1);
  });

  it("handles spring-forward DST day correctly", () => {
    // 2026-03-29 01:30 UTC: Stockholm is in the middle of the DST jump.
    vi.setSystemTime(new Date("2026-03-29T01:30:00Z"));
    expect(todayInSweden().day).toBe(29);
    expect(todayInSweden().month).toBe(3);
  });

  it("handles fall-back DST day correctly", () => {
    // 2026-10-25 01:30 UTC: Stockholm is in the middle of the DST fall-back.
    vi.setSystemTime(new Date("2026-10-25T01:30:00Z"));
    expect(todayInSweden().day).toBe(25);
    expect(todayInSweden().month).toBe(10);
  });

  it("matches direct Intl.DateTimeFormat output for the current real Date", () => {
    vi.useRealTimers();
    const fmt = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Stockholm",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const expected = fmt.format(new Date());
    const today = todayInSweden();
    const actual = `${String(today.year).padStart(4, "0")}-${String(today.month).padStart(2, "0")}-${String(today.day).padStart(2, "0")}`;
    expect(actual).toBe(expected);
  });
});
