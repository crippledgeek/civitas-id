import type { IdFormat } from "./id-format.js";
import type { LocalDate } from "./local-date.js";
import type { OfficialId } from "./official-id.js";

export interface OrganisationOfficialId<F extends IdFormat> extends OfficialId<F> {
  isLegalPerson(): boolean;
  isPhysicalPerson(): boolean;
  getRegistrationDate(): LocalDate | undefined;
  getOrganisationType(): string | undefined;
}
