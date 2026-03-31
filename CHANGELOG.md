# Changelog

## 1.0.3 (2026-03-31)

### Fixes

- Add `prepare` lifecycle script to auto-build workspace packages after `pnpm install` ([#9](https://github.com/crippledgeek/civitas-id/issues/9))

### Docs

- Add BUILDING.md with full development setup guide for contributors

## 1.0.1 (2026-03-02)

### Fixes

- Include README.md in published npm packages

## 1.0.0 (2026-03-02)

Initial release of the civitas-id TypeScript library for Swedish official identity number validation.

### Packages

- `@deathbycode/civitas-id-core@1.0.0` — Core interfaces and utilities
- `@deathbycode/civitas-id-sweden@1.0.0` — Swedish implementations

### Features

- **PersonalId** — Parse, validate, and format Swedish personal identity numbers (personnummer)
- **CoordinationId** — Parse, validate, and format Swedish coordination numbers (samordningsnummer)
- **OrganisationId** — Parse, validate, and format Swedish organisation numbers (organisationsnummer)
- **SwedishOfficialId** — Unified parser that detects and returns the correct ID type
- **Formatting** — 10-digit, 12-digit, long, and short format output
- **Luhn validation** — Generic and Swedish-specific Luhn check digit verification
- **LocalDate** — Lightweight date value object (no external dependencies)
- **ValidationResult** — Discriminated union for type-safe validation outcomes
- **Test fakers** — `PersonalIdFaker`, `CoordinationIdFaker`, `SwedishOrganisationIdFaker`, `SwedishOfficialIdFaker` available via `@deathbycode/civitas-id-sweden/testing`

### Infrastructure

- ESM-only packages with TypeScript declarations
- pnpm monorepo with workspace protocol
- Biome for linting
- Vitest for testing (34,026 tests)
- GitHub Actions CI (build, lint, test)
- GitHub Actions publish workflow with npm trusted publishing (OIDC provenance)
