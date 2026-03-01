import type { PersonOfficialId } from "@civitas-id/core";
import type { IdFaker } from "./id-faker.js";

/**
 * Faker interface for person identification numbers.
 */
export interface PersonIdFaker<T extends PersonOfficialId<string>> extends IdFaker<T> {}
