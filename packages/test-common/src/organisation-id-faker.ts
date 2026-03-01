import type { OrganisationOfficialId } from "@civitas-id/core";
import type { IdFaker } from "./id-faker.js";

/**
 * Faker type for organisation identification numbers.
 */
export type OrganisationIdFaker<T extends OrganisationOfficialId> = IdFaker<T>;
