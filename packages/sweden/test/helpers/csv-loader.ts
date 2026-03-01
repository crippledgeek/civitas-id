import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const fixturesDir = join(fileURLToPath(import.meta.url), "../../fixtures");

export function loadCsv(filename: string): string[] {
  const filePath = join(fixturesDir, filename);
  const content = readFileSync(filePath, "utf-8");
  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

export interface CsvRow {
  [key: string]: string;
}

export function loadCsvWithHeaders(filename: string): CsvRow[] {
  const lines = loadCsv(filename);
  if (lines.length === 0) return [];

  const headers = (lines[0] as string).split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim());
    const row: CsvRow = {};
    headers.forEach((header, i) => {
      row[header] = values[i] ?? "";
    });
    return row;
  });
}
