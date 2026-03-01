/**
 * Enumeration of Swedish organisation number types.
 */
export const OrganisationNumberType = {
  /** Legal person (juridisk person) - month >= 20. */
  LEGAL_PERSON: "LEGAL_PERSON",
  /** Physical person (fysisk person) - sole proprietorship with month < 20. */
  PHYSICAL_PERSON: "PHYSICAL_PERSON",
  /** Could be either legal or physical person - requires additional context. */
  LEGAL_OR_PHYSICAL_PERSON: "LEGAL_OR_PHYSICAL_PERSON",
} as const;

export type OrganisationNumberType =
  (typeof OrganisationNumberType)[keyof typeof OrganisationNumberType];
