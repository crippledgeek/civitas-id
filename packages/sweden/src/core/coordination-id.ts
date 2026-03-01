import { LocalDate } from "@civitas-id/core";
import { IllegalIdNumberException } from "../error/illegal-id-number-exception.js";
import type { PnrFormat } from "../format/pnr-format.js";
import { AbstractPersonId } from "./abstract-person-id.js";
import { OrganisationId } from "./organisation-id.js";
import {
  getPossibleFullIdNumber,
  isIdNumberFull,
  isValidCoordinationDate,
} from "./person-official-id-base.js";
import { PersonalId } from "./personal-id.js";
import { createMatcher } from "./swedish-id-matcher.js";

export function isCoordinationNumberFull(fullCoordinationNumber: string): boolean {
  return isIdNumberFull(fullCoordinationNumber, isValidCoordinationDate);
}

/**
 * Represents a Swedish coordination ID (samordningsnummer).
 * The day component is increased by 60 to distinguish from personal IDs.
 */
export class CoordinationId extends AbstractPersonId {
  readonly type = "COORDINATION" as const;

  private constructor(id: string) {
    super(id);
  }

  static parse(text: string | null | undefined): CoordinationId | undefined {
    try {
      return CoordinationId.parseOrThrow(text as string);
    } catch {
      return undefined;
    }
  }

  static parseOrThrow(text: string): CoordinationId {
    const m = createMatcher(text);
    if (m.noMatch()) throw new IllegalIdNumberException(`Invalid coordination ID: ${text}`);

    const full = m.hasCentury() ? m.getLongFormat() : getPossibleFullIdNumber(m);
    if (!isCoordinationNumberFull(full))
      throw new IllegalIdNumberException(`Invalid coordination ID: ${text}`);
    return new CoordinationId(full);
  }

  static format(text: string, format: PnrFormat): string {
    return CoordinationId.parseOrThrow(text).formatted(format);
  }

  static isValid(text: string | null | undefined): boolean {
    try {
      const m = createMatcher(text as string);
      if (m.noMatch()) return false;
      const full = m.hasCentury() ? m.getLongFormat() : getPossibleFullIdNumber(m);
      return isCoordinationNumberFull(full);
    } catch {
      return false;
    }
  }

  getBirthDate(): LocalDate {
    const s = this.longFormat();
    const coordDay = Number.parseInt(s.substring(6, 8), 10);
    const actualDay = coordDay - 60;
    return LocalDate.of(
      Number.parseInt(s.substring(0, 4), 10),
      Number.parseInt(s.substring(4, 6), 10),
      actualDay,
    );
  }

  getIdType(): string {
    return "COORDINATION";
  }

  toOrganisationId(): OrganisationId {
    return OrganisationId.parseOrThrow(this._id);
  }
}

/**
 * Union type for person official IDs (PersonalId | CoordinationId).
 */
export type PersonOfficialIdBase = PersonalId | CoordinationId;

export const PersonOfficialIdBase = {
  isValid(text: string | null | undefined): boolean {
    return PersonalId.isValid(text) || CoordinationId.isValid(text);
  },

  format(text: string, format: PnrFormat): string {
    if (CoordinationId.isValid(text)) return CoordinationId.parseOrThrow(text).formatted(format);
    if (PersonalId.isValid(text)) return PersonalId.parseOrThrow(text).formatted(format);
    throw new IllegalIdNumberException(`Invalid person official ID: ${text}`);
  },
};
