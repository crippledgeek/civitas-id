import { LocalDate, computeAge } from "@deathbycode/civitas-id-core";
import { todayInSweden } from "../../internal/sweden-clock.js";
import { swedishAnniversaryResolver } from "../../internal/swedish-anniversary.js";
import { SwedishLuhnAlgorithm } from "../../validation/swedish-luhn-algorithm.js";

/**
 * Returns a uniformly-random integer in the half-open range `[min, max)`.
 *
 * Uses rejection sampling against a `Uint32` source to avoid the modulo
 * bias that affects naive `value % range` for non-power-of-two ranges.
 *
 * @param min - inclusive lower bound
 * @param max - exclusive upper bound
 * @throws {RangeError} if `max <= min`
 */
export function randomInt(min: number, max: number): number {
  if (max <= min) throw new RangeError(`max (${max}) must be greater than min (${min})`);
  const range = max - min;
  // Largest multiple of `range` that fits in a Uint32. Values >= this are rejected.
  const limit = Math.floor(0x1_0000_0000 / range) * range;
  const buf = new Uint32Array(1);
  while (true) {
    crypto.getRandomValues(buf);
    const value = buf[0];
    if (value === undefined) throw new Error("Failed to generate random value");
    if (value < limit) return min + (value % range);
  }
}

export function randomBirthDate(): LocalDate {
  let date: LocalDate;
  do {
    const year = randomInt(1970, 2020);
    const month = randomInt(1, 13);
    const day = randomInt(1, 32); // 1..31; isValid() loop rejects invalid combos (e.g. Feb 30)
    date = LocalDate.of(year, month, day);
  } while (!date.isValid());
  return date;
}

export function randomBirthNumber(): number {
  return randomInt(0, 1000);
}

export function makeMaleBirthNumber(birthNumber: number): number {
  return Math.floor(birthNumber / 10) * 10 + ((birthNumber % 10) | 1);
}

export function makeFemaleBirthNumber(birthNumber: number): number {
  return Math.floor(birthNumber / 10) * 10 + ((birthNumber % 10) & ~1);
}

export function buildIdString(
  birthDate: LocalDate,
  birthNumber: number,
  dayOffset: number,
): { base: string; checkDigit: number; age: number } {
  const yy = String(birthDate.year % 100).padStart(2, "0");
  const mm = String(birthDate.month).padStart(2, "0");
  const dd = String(birthDate.day + dayOffset).padStart(2, "0");
  const bbb = String(birthNumber).padStart(3, "0");

  const base = yy + mm + dd + bbb;
  const checkDigit = SwedishLuhnAlgorithm.calculateCheckDigit(base);
  const age = computeAge(birthDate, todayInSweden(), swedishAnniversaryResolver);

  return { base, checkDigit, age };
}
