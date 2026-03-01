import { LocalDate } from "@civitas-id/core";
import { IllegalIdNumberException } from "../error/illegal-id-number-exception.js";
import type { PnrFormat } from "../format/pnr-format.js";
import { AbstractPersonId } from "./abstract-person-id.js";
import { ChecksumValidator } from "./checksum-validator.js";
import type { PersonOfficialIdBase } from "./coordination-id.js";
import { OrganisationId } from "./organisation-id.js";
import { getPossibleFullIdNumber, isValidPersonDate } from "./person-official-id-base.js";
import { createMatcher } from "./swedish-id-matcher.js";

export function isPersonalNumberFull(fullPersonalNumber: string): boolean {
  if (!isValidPersonDate(fullPersonalNumber)) return false;
  const tenDigits = fullPersonalNumber.substring(2, 8) + fullPersonalNumber.substring(9);
  return ChecksumValidator.isChecksumValid(tenDigits);
}

/**
 * Represents a Swedish personal identification number (personnummer).
 */
export class PersonalId extends AbstractPersonId {
  readonly type = "PERSONAL" as const;

  private constructor(id: string) {
    super(id);
  }

  static parse(text: string | null | undefined): PersonalId | undefined {
    try {
      return PersonalId.parseOrThrow(text as string);
    } catch {
      return undefined;
    }
  }

  static parseOrThrow(text: string): PersonalId {
    const m = createMatcher(text);
    if (m.noMatch()) throw new IllegalIdNumberException(`Invalid personal ID: ${text}`);

    const full = m.hasCentury() ? m.getLongFormat() : getPossibleFullIdNumber(m);
    if (!isPersonalNumberFull(full))
      throw new IllegalIdNumberException(`Invalid personal ID: ${text}`);
    return new PersonalId(full);
  }

  static format(text: string, format: PnrFormat): string {
    return PersonalId.parseOrThrow(text).formatted(format);
  }

  static isValid(text: string | null | undefined): boolean {
    try {
      const m = createMatcher(text as string);
      if (m.noMatch()) return false;
      const full = m.hasCentury() ? m.getLongFormat() : getPossibleFullIdNumber(m);
      return isPersonalNumberFull(full);
    } catch {
      return false;
    }
  }

  getBirthDate(): LocalDate {
    const s = this.longFormat();
    return LocalDate.of(
      Number.parseInt(s.substring(0, 4), 10),
      Number.parseInt(s.substring(4, 6), 10),
      Number.parseInt(s.substring(6, 8), 10),
    );
  }

  getIdType(): string {
    return "PERSONAL";
  }

  toOrganisationId(): OrganisationId {
    return OrganisationId.parseOrThrow(this._id);
  }

  toPersonOfficialId(): PersonOfficialIdBase {
    return this;
  }

  equals(other: unknown): boolean {
    if (!(other instanceof PersonalId)) return false;
    return this.longFormat() === other.longFormat();
  }
}
