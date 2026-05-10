# Changelog

## 2.0.0 (2026-05-10)

### BREAKING CHANGES

- **`@deathbycode/civitas-id-core`**: removed `LocalDate.now()` and `LocalDate.age()`. These methods picked an implicit jurisdiction (UTC for `now`, Feb-29-strict for `age`), which is legally incorrect for any caller subject to a real civil-time jurisdiction. Migration: call the country package's clock helper (e.g. `todayInSweden()`) and `computeAge(birth, today, resolver)` from core. ([#14](https://github.com/crippledgeek/civitas-id/issues/14))

### Added

- **core**: `AnniversaryResolver` interface and `computeAge(birth, today, resolver)` utility for jurisdiction-aware age computation.
- **sweden** (internal): `todayInSweden()` anchored to IANA `Europe/Stockholm` via `Intl.DateTimeFormat` (zero-dep).
- **sweden** (internal): `swedishAnniversaryResolver` implementing Lag (1930:173) §1 — Feb-29 birthdays attain age on Feb-28 in non-leap years.

### Fixes

- **sweden**: `getAge`, `isAdult`, `isChild` (with default clock) now resolve "today" through `Europe/Stockholm` instead of UTC. Fixes the 1–2 hour window every birthday where the library reported the wrong age. ([#14](https://github.com/crippledgeek/civitas-id/issues/14))
- **sweden**: 2-digit-year century inference now uses Stockholm civil date — previously a personnummer parsed in the Stockholm-midnight–UTC-midnight window at year-end resolved to the wrong century. ([#14](https://github.com/crippledgeek/civitas-id/issues/14))
- **sweden**: centenarian `+`-separator decision now uses Stockholm civil date — previously the `+` flipped a day late at the centenarian boundary. ([#14](https://github.com/crippledgeek/civitas-id/issues/14))
- **sweden**: leap-day birthdays (born Feb-29) now correctly attain age on Feb-28 in non-leap years per Lag (1930:173) §1. ([#14](https://github.com/crippledgeek/civitas-id/issues/14))

## 1.0.2 (2026-03-31)

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
