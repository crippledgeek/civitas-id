import type { OrganisationOfficialId } from "@civitas-id/core";
import type { IdFaker } from "./id-faker.js";

/**
 * Faker interface for organisation identification numbers.
 */
export interface OrganisationIdFaker<T extends OrganisationOfficialId<string>> extends IdFaker<T> {}
