import { InvalidIdNumberError } from "../error/invalid-id-number-error.js";
import { OrganisationNumberType } from "../format/organisation-number-type.js";
import type { PnrFormat } from "../format/pnr-format.js";
import { CoordinationId } from "./coordination-id.js";
import { PersonOfficialIdBase } from "./coordination-id.js";
import { OrganisationId } from "./organisation-id.js";
import { PersonalId } from "./personal-id.js";

export type SwedishOfficialId = PersonalId | CoordinationId | OrganisationId;

export const SwedishOfficialId = {
  isValid(text: string | null | undefined): boolean {
    return (
      PersonOfficialIdBase.isValid(text) ||
      OrganisationId.isValid(text, OrganisationNumberType.LEGAL_PERSON)
    );
  },

  parseAny(text: string | null | undefined): SwedishOfficialId | undefined {
    const personal = PersonalId.parse(text);
    if (personal !== undefined) return personal;
    const coord = CoordinationId.parse(text);
    if (coord !== undefined) return coord;
    return OrganisationId.parse(text);
  },

  parseAnyOrThrow(text: string): SwedishOfficialId {
    const result = SwedishOfficialId.parseAny(text);
    if (result === undefined) throw new InvalidIdNumberError(`Invalid Swedish ID number: ${text}`);
    return result;
  },

  format(text: string, format: PnrFormat): string {
    if (PersonOfficialIdBase.isValid(text)) return PersonOfficialIdBase.format(text, format);
    if (OrganisationId.isValid(text, OrganisationNumberType.LEGAL_PERSON)) {
      return OrganisationId.parseOrThrow(text, OrganisationNumberType.LEGAL_PERSON).formatted(
        format,
      );
    }
    throw new InvalidIdNumberError(`Invalid Swedish ID number: ${text}`);
  },
};

export function isPersonalId(id: SwedishOfficialId): id is PersonalId {
  return id instanceof PersonalId;
}

export function isCoordinationId(id: SwedishOfficialId): id is CoordinationId {
  return id instanceof CoordinationId;
}

export function isOrganisationId(id: SwedishOfficialId): id is OrganisationId {
  return id instanceof OrganisationId;
}

export function isPersonOfficialId(id: SwedishOfficialId): id is PersonOfficialIdBase {
  return id instanceof PersonalId || id instanceof CoordinationId;
}
