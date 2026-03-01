import { LocalDate } from "@civitas-id/core";
import { SwedishLuhnAlgorithm } from "../../validation/swedish-luhn-algorithm.js";

export function randomInt(min: number, max: number): number {
  if (max <= min) throw new RangeError(`max (${max}) must be greater than min (${min})`);
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  const value = buf[0];
  if (value === undefined) throw new Error("Failed to generate random value");
  return min + (value % (max - min));
}

export function randomBirthDate(): LocalDate {
  let date: LocalDate;
  do {
    const year = randomInt(1970, 2020);
    const month = randomInt(1, 13);
    const day = randomInt(1, 29);
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
  const age = birthDate.age(LocalDate.now());

  return { base, checkDigit, age };
}
