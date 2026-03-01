/**
 * Re-export shim — preserves all import paths that reference swedish-ids.js.
 * Actual implementations live in per-class modules.
 */
export { PersonalId } from "./personal-id.js";
export { CoordinationId, PersonOfficialIdBase } from "./coordination-id.js";
export { OrganisationId } from "./organisation-id.js";
export {
  SwedishOfficialId,
  isPersonalId,
  isCoordinationId,
  isOrganisationId,
  isPersonOfficialId,
} from "./swedish-official-id.js";
