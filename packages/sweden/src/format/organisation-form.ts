/**
 * Swedish organisation legal forms ("organisationsform").
 * The organisation form is encoded in positions 1-2 of the organisation number.
 * Source: Swedish Companies Registration Office (Bolagsverket)
 */
export type OrganisationFormKey =
  | "NONE"
  | "ENKLA_BOLAG"
  | "PARTREDERIER"
  | "HANDELSBOLAG_KOMMANDITBOLAG"
  | "GRUVBOLAG"
  | "BANKAKTIEBOLAG"
  | "FORSAKRINGSAKTIEBOLAG"
  | "EUROPABOLAG"
  | "AKTIEBOLAG_OVRIGA"
  | "EKONOMISKA_FORENINGAR"
  | "BOSTADSRATTSFORENINGAR"
  | "KOOPERATIV_HYRESRATTSFORENING"
  | "EUROPAKOOPERATIV_EGTS_ERIC"
  | "IDEELLA_FORENINGAR"
  | "SAMFALLIGHETER"
  | "REGISTRERAT_TROSSAMFUND"
  | "FAMILJESTIFTELSER"
  | "STIFTELSER_FONDER_OVRIGA"
  | "STATLIGA_ENHETER"
  | "KOMMUNER"
  | "KOMMUNALFORBUND"
  | "REGIONER"
  | "ALLMANNA_FORSAKRINGSKASSOR"
  | "OFFENTLIGA_KORPORATIONER_ANSTALTER"
  | "HYPOTEKSFORENINGAR"
  | "REGIONALA_STATLIGA_MYNDIGHETER"
  | "OSKIFTADE_DODSBON"
  | "OMSESIDIGA_FORSAKRINGSBOLAG"
  | "SPARBANKER"
  | "UNDERSTODSFORENINGAR_FORSAKRINGSFORENINGAR"
  | "ARBETSLOSHETSKASSOR"
  | "UTLANDSKA_JURIDISKA_PERSONER"
  | "OVRIGA_SVENSKA_JURIDISKA_PERSONER"
  | "JURIDISK_FORM_EJ_UTREDD";

export interface OrganisationFormEntry {
  readonly code: number;
  readonly description: string;
  readonly name: OrganisationFormKey;
}

const FORMS: Record<OrganisationFormKey, OrganisationFormEntry> = {
  NONE: { code: 0, description: "Ingen organisationsform - Fysisk person", name: "NONE" },
  ENKLA_BOLAG: { code: 21, description: "Enkla bolag", name: "ENKLA_BOLAG" },
  PARTREDERIER: { code: 22, description: "Partrederier", name: "PARTREDERIER" },
  HANDELSBOLAG_KOMMANDITBOLAG: {
    code: 31,
    description: "Handelsbolag, kommanditbolag",
    name: "HANDELSBOLAG_KOMMANDITBOLAG",
  },
  GRUVBOLAG: { code: 32, description: "Gruvbolag", name: "GRUVBOLAG" },
  BANKAKTIEBOLAG: { code: 41, description: "Bankaktiebolag", name: "BANKAKTIEBOLAG" },
  FORSAKRINGSAKTIEBOLAG: {
    code: 42,
    description: "Försäkringsaktiebolag",
    name: "FORSAKRINGSAKTIEBOLAG",
  },
  EUROPABOLAG: { code: 43, description: "Europabolag", name: "EUROPABOLAG" },
  AKTIEBOLAG_OVRIGA: { code: 49, description: "Övriga aktiebolag", name: "AKTIEBOLAG_OVRIGA" },
  EKONOMISKA_FORENINGAR: {
    code: 51,
    description: "Ekonomiska föreningar",
    name: "EKONOMISKA_FORENINGAR",
  },
  BOSTADSRATTSFORENINGAR: {
    code: 53,
    description: "Bostadsrättsföreningar",
    name: "BOSTADSRATTSFORENINGAR",
  },
  KOOPERATIV_HYRESRATTSFORENING: {
    code: 54,
    description: "Kooperativ Hyresrättsförening",
    name: "KOOPERATIV_HYRESRATTSFORENING",
  },
  EUROPAKOOPERATIV_EGTS_ERIC: {
    code: 55,
    description: "Europakooperativ, EGTS och Eric-konsortier",
    name: "EUROPAKOOPERATIV_EGTS_ERIC",
  },
  IDEELLA_FORENINGAR: { code: 61, description: "Ideella föreningar", name: "IDEELLA_FORENINGAR" },
  SAMFALLIGHETER: { code: 62, description: "Samfälligheter", name: "SAMFALLIGHETER" },
  REGISTRERAT_TROSSAMFUND: {
    code: 63,
    description: "Registrerat trossamfund",
    name: "REGISTRERAT_TROSSAMFUND",
  },
  FAMILJESTIFTELSER: { code: 71, description: "Familjestiftelser", name: "FAMILJESTIFTELSER" },
  STIFTELSER_FONDER_OVRIGA: {
    code: 72,
    description: "Övriga stiftelser och fonder",
    name: "STIFTELSER_FONDER_OVRIGA",
  },
  STATLIGA_ENHETER: { code: 81, description: "Statliga enheter", name: "STATLIGA_ENHETER" },
  KOMMUNER: { code: 82, description: "Kommuner", name: "KOMMUNER" },
  KOMMUNALFORBUND: { code: 83, description: "Kommunalförbund", name: "KOMMUNALFORBUND" },
  REGIONER: { code: 84, description: "Regioner", name: "REGIONER" },
  ALLMANNA_FORSAKRINGSKASSOR: {
    code: 85,
    description: "Allmänna försäkringskassor",
    name: "ALLMANNA_FORSAKRINGSKASSOR",
  },
  OFFENTLIGA_KORPORATIONER_ANSTALTER: {
    code: 87,
    description: "Offentliga korporationer och anstalter",
    name: "OFFENTLIGA_KORPORATIONER_ANSTALTER",
  },
  HYPOTEKSFORENINGAR: { code: 88, description: "Hypoteksföreningar", name: "HYPOTEKSFORENINGAR" },
  REGIONALA_STATLIGA_MYNDIGHETER: {
    code: 89,
    description: "Regionala statliga myndigheter",
    name: "REGIONALA_STATLIGA_MYNDIGHETER",
  },
  OSKIFTADE_DODSBON: { code: 91, description: "Oskiftade dödsbon", name: "OSKIFTADE_DODSBON" },
  OMSESIDIGA_FORSAKRINGSBOLAG: {
    code: 92,
    description: "Ömsesidiga försäkringsbolag",
    name: "OMSESIDIGA_FORSAKRINGSBOLAG",
  },
  SPARBANKER: { code: 93, description: "Sparbanker", name: "SPARBANKER" },
  UNDERSTODSFORENINGAR_FORSAKRINGSFORENINGAR: {
    code: 94,
    description: "Understödsföreningar och Försäkringsföreningar",
    name: "UNDERSTODSFORENINGAR_FORSAKRINGSFORENINGAR",
  },
  ARBETSLOSHETSKASSOR: {
    code: 95,
    description: "Arbetslöshetskassor",
    name: "ARBETSLOSHETSKASSOR",
  },
  UTLANDSKA_JURIDISKA_PERSONER: {
    code: 96,
    description: "Utländska juridiska personer",
    name: "UTLANDSKA_JURIDISKA_PERSONER",
  },
  OVRIGA_SVENSKA_JURIDISKA_PERSONER: {
    code: 98,
    description: "Övriga svenska juridiska personer bildade enligt särskild lagstiftning",
    name: "OVRIGA_SVENSKA_JURIDISKA_PERSONER",
  },
  JURIDISK_FORM_EJ_UTREDD: {
    code: 99,
    description: "Juridisk form ej utredd",
    name: "JURIDISK_FORM_EJ_UTREDD",
  },
};

/** Reverse lookup: numeric code → OrganisationFormEntry */
const CODE_MAP = new Map<number, OrganisationFormEntry>(
  Object.values(FORMS).map((e) => [e.code, e] as const),
);

export const OrganisationForm = {
  ...FORMS,

  /**
   * Finds the organisation form by its numeric code.
   * Returns undefined if not found.
   */
  fromCode(code: number): OrganisationFormEntry | undefined {
    return CODE_MAP.get(code);
  },

  /**
   * Extracts and returns the organisation form from an organisation number string.
   * The form code is found in the first 2 digits of the 10-digit number.
   * For 12-digit numbers (16NNNNNNNNNN), skips the "16" prefix.
   * Returns JURIDISK_FORM_EJ_UTREDD if not found or invalid.
   */
  fromOrganisationNumber(organisationNumber: string): OrganisationFormEntry {
    const cleaned = organisationNumber.replace(/[-\s+]/g, "");

    let startPos: number;
    if (cleaned.length === 10) {
      startPos = 0;
    } else if (cleaned.length === 12 && cleaned.startsWith("16")) {
      startPos = 2;
    } else {
      return FORMS.JURIDISK_FORM_EJ_UTREDD;
    }

    if (cleaned.length < startPos + 2) {
      return FORMS.JURIDISK_FORM_EJ_UTREDD;
    }

    const formCodeStr = cleaned.substring(startPos, startPos + 2);
    const formCode = Number.parseInt(formCodeStr, 10);
    if (Number.isNaN(formCode)) {
      return FORMS.JURIDISK_FORM_EJ_UTREDD;
    }

    return CODE_MAP.get(formCode) ?? FORMS.JURIDISK_FORM_EJ_UTREDD;
  },
} as const;
