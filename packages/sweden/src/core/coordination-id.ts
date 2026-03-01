import { LocalDate } from "@civitas-id/core";
import { InvalidIdNumberError } from "../error/invalid-id-number-error.js";
import type { PnrFormat } from "../format/pnr-format.js";
import { AbstractPersonId } from "./abstract-person-id.js";
import { OrganisationId } from "./organisation-id.js";
import { getPossibleFullIdNumber, isCoordinationNumberFull } from "./person-official-id-base.js";
import { PersonalId } from "./personal-id.js";
import { createMatcher } from "./swedish-id-matcher.js";

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
    if (text == null) return undefined;
    try {
      return CoordinationId.parseOrThrow(text);
    } catch (e) {
      if (e instanceof InvalidIdNumberError) return undefined;
      throw e;
    }
  }

  static parseOrThrow(text: string): CoordinationId {
    const m = createMatcher(text);
    if (m.noMatch()) throw new InvalidIdNumberError(`Invalid coordination ID: ${text}`);

    const full = m.hasCentury() ? m.getLongFormat() : getPossibleFullIdNumber(m);
    if (!isCoordinationNumberFull(full))
      throw new InvalidIdNumberError(`Invalid coordination ID: ${text}`);
    return new CoordinationId(full);
  }

  static format(text: string, format: PnrFormat): string {
    return CoordinationId.parseOrThrow(text).formatted(format);
  }

  static isValid(text: string | null | undefined): boolean {
    if (text == null) return false;
    try {
      const m = createMatcher(text);
      if (m.noMatch()) return false;
      const full = m.hasCentury() ? m.getLongFormat() : getPossibleFullIdNumber(m);
      return isCoordinationNumberFull(full);
    } catch (e) {
      if (e instanceof InvalidIdNumberError) return false;
      throw e;
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
    throw new InvalidIdNumberError(`Invalid person official ID: ${text}`);
  },
};
