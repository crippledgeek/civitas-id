import type { PersonOfficialId } from "@deathbycode/civitas-id-core";
import type { IdFaker } from "./id-faker.js";

/**
 * Faker type for person identification numbers.
 */
export type PersonIdFaker<T extends PersonOfficialId> = IdFaker<T>;
