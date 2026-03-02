# Civitas ID

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7%2B-blue)](https://www.typescriptlang.org/)
[![pnpm](https://img.shields.io/badge/pnpm-10.30%2B-blue)](https://pnpm.io/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Tests](https://img.shields.io/badge/Tests-34,026%20passing-brightgreen)](packages/sweden/test)

A comprehensive TypeScript library for validating and working with Swedish personal identification numbers (personnummer), coordination numbers (samordningsnummer), and organisation numbers (organisationsnummer).

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Usage Examples](#usage-examples)
- [Error Handling](#error-handling)
- [Format Options](#format-options)
- [Type Guards & Discriminated Unions](#type-guards--discriminated-unions)
- [Test Utilities (Fakers)](#test-utilities-fakers)
- [Architecture](#architecture)
- [Core Utilities](#core-utilities)
- [Requirements](#requirements)
- [Building the Project](#building-the-project)
- [API Design](#api-design)
- [Swedish Organisation Number Format](#swedish-organisation-number-format)
- [Organisation Forms](#organisation-forms)
- [License](#license)

## Overview

This library provides comprehensive functionality for working with Swedish official identification numbers according to official rules and formats from Skatteverket and Bolagsverket.

## Features

### Personal Identification
- **Personal Numbers (personnummer)**: Validation and formatting of Swedish personal ID numbers
- **Coordination Numbers (samordningsnummer)**: Support for coordination numbers assigned to individuals without Swedish personal numbers
- Support for different formats (10-digit, 12-digit, with or without separators)
- Handling of personal numbers from different time periods (19th, 20th, and 21st centuries)
- Birth date extraction and age calculation
- Gender determination (male/female)

### Organisation Identification
- **Organisation Numbers (organisationsnummer)**: Validation and formatting of Swedish organisation numbers
- **Organisation Form Detection**: Automatic detection of organisation type (e.g., Aktiebolag, Ekonomiska foreningar, etc.)
  - Support for all 33 official Swedish organisation forms
  - Distinction between legal persons (juridisk person) and physical persons (enskild firma)
- **Hybrid Format Support**: Accepts both official 10-digit format and legacy 12-digit format for compatibility
  - **Input**: Accepts `556012-3456` (10-digit) or `165560123456` (12-digit legacy)
  - **Output**: Always returns official 10-digit format

### Additional Features
- Checksum validation using the Luhn algorithm
- Type-safe API with discriminated unions and type guards
- Comprehensive error messages via `InvalidIdNumberError`
- Extensive test coverage (34,026 tests)
- Test utilities (fakers) for generating valid test data

## Installation

```bash
npm install @deathbycode/civitas-id-sweden
# or
pnpm add @deathbycode/civitas-id-sweden
```

## Usage Examples

### Personal Numbers

```typescript
import { PersonalId } from "@deathbycode/civitas-id-sweden";

// Parse and validate a personal number (returns undefined on failure)
const personalId = PersonalId.parse("202407132394");

if (personalId) {
  const birthDate = personalId.getBirthDate(); // LocalDate { year: 2024, month: 7, day: 13 }
  const longFormat = personalId.longFormat();    // "202407132394"
}

// Or use parseOrThrow() when you expect valid input
const id = PersonalId.parseOrThrow("202407132394");
const birthDate = id.getBirthDate();

// Format in different ways
id.longFormat();                  // "202407132394"
id.shortFormat();                 // "2407132394"
id.shortFormatWithSeparator();    // "240713-2394"

// Check gender
id.isMale();    // true or false
id.isFemale();  // true or false

// Check age
id.getAge();    // current age in years
id.isAdult();   // true if 18+
id.isChild();   // true if under 18

// Check if valid
PersonalId.isValid("202407132394"); // true
```

### Coordination Numbers

```typescript
import { CoordinationId } from "@deathbycode/civitas-id-sweden";

// Parse a coordination number (returns undefined on failure)
const coordId = CoordinationId.parse("198206822390");

// Or use parseOrThrow() when you expect valid input
const id = CoordinationId.parseOrThrow("198206822390");

// Coordination numbers have birth day + 60
const birthDate = id.getBirthDate(); // 1982-06-22 (not 1982-06-82)
```

### Organisation Numbers

```typescript
import { OrganisationId, OrganisationNumberType } from "@deathbycode/civitas-id-sweden";

// Parse an organisation number (accepts both 10 and 12-digit formats)
const orgId = OrganisationId.parse("556012-3456");

// Or use parseOrThrow() when you expect valid input
const id = OrganisationId.parseOrThrow("556012-3456");

// Get the organisation form
const form = id.getOrganisationForm();
console.log(form.code);        // 56
console.log(form.description); // "Ovriga aktiebolag"

// Check if legal or physical person
id.isLegalPerson();   // true for companies
id.isPhysicalPerson(); // true for sole proprietors

// Format (always outputs 10-digit official format)
id.longFormatWithSeparator(); // "556012-3456"

// Validate with type checking
OrganisationId.isValid("556012-3456", OrganisationNumberType.LEGAL_PERSON);
```

### Parsing Any Swedish ID Type

When you don't know the specific type of Swedish ID, use the unified parsing methods:

```typescript
import {
  SwedishOfficialId,
  PersonalId,
  CoordinationId,
  OrganisationId,
  InvalidIdNumberError,
  isPersonalId,
  isCoordinationId,
  isOrganisationId,
} from "@deathbycode/civitas-id-sweden";

// Parse any Swedish ID type (returns undefined on failure)
const result = SwedishOfficialId.parseAny("202407132394");

if (result) {
  // Use type guards to narrow the type
  if (isPersonalId(result)) {
    console.log("Personal ID:", result.getBirthDate());
  } else if (isCoordinationId(result)) {
    console.log("Coordination ID:", result.getBirthDate());
  } else if (isOrganisationId(result)) {
    console.log("Organisation ID:", result.getOrganisationForm());
  }
}

// Or use parseAnyOrThrow() when you expect valid input
try {
  const id = SwedishOfficialId.parseAnyOrThrow("202407132394");

  // Use discriminated union with switch
  switch (id.type) {
    case "PERSONAL":
      console.log(id.getBirthDate());
      break;
    case "COORDINATION":
      console.log(id.getBirthDate());
      break;
    case "ORGANISATION":
      console.log(id.getOrganisationForm());
      break;
  }
} catch (e) {
  if (e instanceof InvalidIdNumberError) {
    console.error("Invalid Swedish ID:", e.message);
  } else {
    throw e;
  }
}

// Validate any Swedish ID type
SwedishOfficialId.isValid("202407132394"); // true
```

**Parsing Priority:**
The unified parser attempts to parse in this order:
1. Personal number (personnummer)
2. Coordination number (samordningsnummer)
3. Organisation number (organisationsnummer)

## Error Handling

All failures from the throwing APIs (`parseOrThrow`, `parseAnyOrThrow`, `format`) throw `InvalidIdNumberError`, which extends the standard `Error` class and supports error cause chaining via `ErrorOptions`. Non-throwing parse helpers (`parse`, `parseAny`) return `undefined` on failure:

```typescript
import { PersonalId, InvalidIdNumberError } from "@deathbycode/civitas-id-sweden";

// Catch and inspect parsing errors
try {
  const id = PersonalId.parseOrThrow("invalid-input");
} catch (e) {
  if (e instanceof InvalidIdNumberError) {
    console.error(e.message); // "Invalid personal ID: invalid-input"
  }
}

// Error cause chaining — wrap lower-level errors
try {
  processId(input);
} catch (e) {
  throw new InvalidIdNumberError("Failed to process ID", { cause: e });
}
```


## Format Options

Personal and coordination IDs support six output formats via the `PnrFormat` union. The separator character is age-sensitive: `-` for persons under 100, `+` for centenarians.

| PnrFormat Value | Pattern | Example (born 1990-05-15) | Example (born 1890-05-15) |
|-----------------|---------|---------------------------|---------------------------|
| `LONG_FORMAT` | `YYYYMMDDXXXX` | `199005151239` | `189005151239` |
| `LONG_FORMAT_WITH_STANDARD_SEPARATOR` | `YYYYMMDD-XXXX` | `19900515-1239` | `18900515-1239` |
| `LONG_FORMAT_WITH_SEPARATOR` | `YYYYMMDD-XXXX` or `YYYYMMDD+XXXX` | `19900515-1239` | `18900515+1239` |
| `SHORT_FORMAT` | `YYMMDDXXXX` | `9005151239` | `9005151239` |
| `SHORT_FORMAT_WITH_STANDARD_SEPARATOR` | `YYMMDD-XXXX` | `900515-1239` | `900515-1239` |
| `SHORT_FORMAT_WITH_SEPARATOR` | `YYMMDD-XXXX` or `YYMMDD+XXXX` | `900515-1239` | `900515+1239` |

```typescript
import { PersonalId, PnrFormat } from "@deathbycode/civitas-id-sweden";

const id = PersonalId.parseOrThrow("199005151239");

// Convenience methods (use standard separator)
id.longFormat();               // "199005151239"
id.shortFormat();              // "9005151239"
id.longFormatWithSeparator();  // "19900515-1239"
id.shortFormatWithSeparator(); // "900515-1239"

// Explicit format selection
id.formatted(PnrFormat.LONG_FORMAT_WITH_SEPARATOR);  // "19900515-1239" (or +)
id.formatted(PnrFormat.SHORT_FORMAT_WITH_SEPARATOR); // "900515-1239" (or +)
```

> **Organisation IDs** also accept `PnrFormat` in their `formatted()` method, but long and short variants produce identical output since organisation numbers are always 10 digits (the internal `16` century prefix is always stripped).

## Type Guards & Discriminated Unions

`SwedishOfficialId` is a union type with a `type` discriminant field:

```typescript
type SwedishOfficialId = PersonalId | CoordinationId | OrganisationId;
```

Each variant carries a `type` field: `"PERSONAL"`, `"COORDINATION"`, or `"ORGANISATION"`.

### Type guard functions

Four type guard functions are exported for narrowing:

```typescript
import {
  SwedishOfficialId,
  isPersonalId,
  isCoordinationId,
  isOrganisationId,
  isPersonOfficialId,
} from "@deathbycode/civitas-id-sweden";

const id = SwedishOfficialId.parseAnyOrThrow(input);

// Narrow to a specific type
if (isPersonalId(id)) {
  id.getBirthDate(); // PersonalId methods available
}

if (isCoordinationId(id)) {
  id.getBirthDate(); // CoordinationId methods available
}

if (isOrganisationId(id)) {
  id.getOrganisationForm(); // OrganisationId methods available
}

// Narrow to person types (PersonalId | CoordinationId)
if (isPersonOfficialId(id)) {
  id.getBirthDate(); // shared person methods available
  id.getAge();
  id.isMale();
}
```

### Switch on discriminant

```typescript
switch (id.type) {
  case "PERSONAL":
    console.log("Personal ID:", id.getBirthDate());
    break;
  case "COORDINATION":
    console.log("Coordination ID:", id.getBirthDate());
    break;
  case "ORGANISATION":
    console.log("Organisation ID:", id.getOrganisationForm());
    break;
}
```

## Test Utilities (Fakers)

The library includes test utilities for generating valid test data, available via a separate subpath export to keep them out of production bundles:

```typescript
import { PersonalIdFaker } from "@deathbycode/civitas-id-sweden/testing";
```

### Personal ID Faker

```typescript
import { PersonalIdFaker } from "@deathbycode/civitas-id-sweden/testing";
import { LocalDate } from "@deathbycode/civitas-id-core";

// Generate random valid personal ID
const randomId = PersonalIdFaker.create();

// Generate with specific birth date
const specificId = PersonalIdFaker.create(LocalDate.of(1990, 5, 15));

// Generate with specific date components
const id = PersonalIdFaker.createFor(1990, 5, 15);

// Generate gender-specific IDs
const male = PersonalIdFaker.createMale();
const female = PersonalIdFaker.createFemale();

// Generate centenarian (100+ years old)
const centenarian = PersonalIdFaker.createCentenarian();
```

### Coordination ID Faker

```typescript
import { CoordinationIdFaker } from "@deathbycode/civitas-id-sweden/testing";

// Generate random coordination ID
const randomId = CoordinationIdFaker.create();

// Gender-specific and centenarian methods also available
const male = CoordinationIdFaker.createMale();
const female = CoordinationIdFaker.createFemale();
const centenarian = CoordinationIdFaker.createCentenarian();
```

### Organisation ID Faker

```typescript
import { SwedishOrganisationIdFaker } from "@deathbycode/civitas-id-sweden/testing";

// Generate random organisation ID (legal person)
const legalPerson = SwedishOrganisationIdFaker.create();

// Generate specific types
const legal = SwedishOrganisationIdFaker.createLegalPerson();
const physical = SwedishOrganisationIdFaker.createPhysicalPerson();
```

### Swedish Official ID Faker

```typescript
import { SwedishOfficialIdFaker } from "@deathbycode/civitas-id-sweden/testing";

// Generate random Swedish ID (PersonalId, CoordinationId, or OrganisationId)
const randomId = SwedishOfficialIdFaker.create();

// Generate multiple IDs at once
const ids = SwedishOfficialIdFaker.createMany(10);
```

**Note:** All fakers generate cryptographically secure random IDs using `crypto.getRandomValues()` and ensure proper Luhn checksum validation.

## Architecture

### Multi-Country Design

The library is architected for multi-country support with a clear separation of concerns:

```
civitas-id/
├── @deathbycode/civitas-id-core          — Generic interfaces and utilities
│   ├── OfficialId, PersonOfficialId, OrganisationOfficialId interfaces
│   ├── Generic Luhn algorithm implementation
│   └── LocalDate value object
└── @deathbycode/civitas-id-sweden        — Swedish implementations
    ├── PersonalId, CoordinationId, OrganisationId
    ├── Swedish-specific validation and formatting
    └── @deathbycode/civitas-id-sweden/testing — Test fakers for generating Swedish IDs
```

**Design Principles:**
- **Core package**: Contains only country-agnostic interfaces and truly generic utilities
- **Country packages**: Implement core interfaces with country-specific validation rules
- **Test utilities**: Available via `@deathbycode/civitas-id-sweden/testing` subpath to keep production bundles clean
- **Discriminated unions**: Type-safe ID hierarchy using TypeScript discriminated unions with `type` field
- **Idiomatic TypeScript**: Default generic parameters, exhaustiveness guards, discriminated union results, const object singletons

**Extensibility:**
The architecture is ready for additional countries (Norway, Finland, Denmark, etc.) following the same pattern. Each country module is self-contained and independent.

## Core Utilities

### LocalDate

A minimal, immutable date value object from `@deathbycode/civitas-id-core`. No external date library dependencies.

```typescript
import { LocalDate } from "@deathbycode/civitas-id-core";

// Factories
const date = LocalDate.of(1990, 5, 15);  // from components
const today = LocalDate.now();            // current UTC date
const parsed = LocalDate.parse("1990-05-15"); // from ISO string

// Read-only properties
date.year;   // 1990
date.month;  // 5
date.day;    // 15

// Methods
date.age();                       // age in years relative to today
date.age(LocalDate.of(2026, 1, 1)); // age relative to a specific date
date.isValid();                   // true if the date exists in the calendar
date.equals(other);               // structural equality
date.toString();                  // "1990-05-15"
```

**Clock injection:** Methods like `getAge()` on ID objects accept an optional clock function `() => LocalDate` so tests can control the current date:

```typescript
const id = PersonalId.parseOrThrow("199005151239");
id.getAge(() => LocalDate.of(2026, 1, 1)); // 35
```

### ValidationResult

A discriminated union for validation outcomes, from `@deathbycode/civitas-id-core`:

```typescript
import { ValidationResult } from "@deathbycode/civitas-id-core";

// Factory methods
const ok = ValidationResult.valid();
//    ^? { valid: true }

const fail = ValidationResult.invalid("Bad checksum", "CHECKSUM");
//    ^? { valid: false, errorMessage: "Bad checksum", errorCode: "CHECKSUM" }

// Narrowing
function check(result: ValidationResult) {
  if (result.valid) {
    // result is { valid: true } — no error fields
  } else {
    console.error(result.errorMessage); // string
    console.error(result.errorCode);    // string | undefined
  }
}

// String representation
ValidationResult.toString(ok);   // "ValidationResult{valid=true}"
ValidationResult.toString(fail); // "ValidationResult{valid=false, errorMessage='Bad checksum', errorCode='CHECKSUM'}"
```

### LuhnAlgorithm

A `const` object implementing the standard Luhn (mod-10) checksum algorithm, from `@deathbycode/civitas-id-core`:

```typescript
import { LuhnAlgorithm } from "@deathbycode/civitas-id-core";

// Calculate the check digit for a digit string
LuhnAlgorithm.calculateCheckDigit("7992739871"); // 3

// Verify a complete number (last digit is the check digit)
LuhnAlgorithm.isChecksumValid("79927398713"); // true
```

Both methods accept an optional `maxDigits` parameter to limit validation to the last N digits of the input. The Swedish variant uses `maxDigits=10` internally so that 12-digit personal numbers (`YYYYMMDDXXXX`) are validated on only the 10-digit suffix (`YYMMDDXXXX`).

## Requirements

- Node.js 18+
- TypeScript 5.7+ (for consumers using TypeScript)

## Building the Project

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm -r build

# Run all tests
pnpm -r test

# Type check
pnpm -r exec tsc --noEmit

# Lint
pnpm biome check .
```

## API Design

The library provides a safe API with two parsing approaches:

| Method | Return Type | Use Case |
|--------|-------------|----------|
| `parse(string)` | `T \| undefined` | Uncertain input (user-provided, external APIs) |
| `parseOrThrow(string)` | `T` | Expected valid input (database, known data) |
| `isValid(string)` | `boolean` | Validation only |

### Format Methods

All ID types implement the `OfficialId` interface and share a common set of format methods:

| Method | PersonalId (1990-05-15) | OrganisationId (556012-3456) |
|--------|-------------------------|------------------------------|
| `longFormat()` | `"199005151239"` | `"5560123456"` |
| `shortFormat()` | `"9005151239"` | `"5560123456"` |
| `longFormatWithSeparator()` | `"19900515-1239"` | `"556012-3456"` |
| `shortFormatWithSeparator()` | `"900515-1239"` | `"556012-3456"` |
| `formatted(PnrFormat)` | *(see [Format Options](#format-options))* | *(long = short for org IDs)* |

> For organisation IDs, long and short variants produce identical output because organisation numbers are always 10 digits.

The base `SwedishOfficialId` namespace provides unified parsing when the ID type is unknown:

| Method | Return Type | Use Case |
|--------|-------------|----------|
| `parseAny(string)` | `SwedishOfficialId \| undefined` | Parse any type (uncertain input) |
| `parseAnyOrThrow(string)` | `SwedishOfficialId` | Parse any type (expected valid) |

## Swedish Organisation Number Format

### Official Standard: 10-Digit Format Only

**Swedish organisation numbers are officially ALWAYS 10 digits.**

Format: `NNNNNN-NNNN` where:
- Positions 1-2: Legal entity group code (organisation form)
- Position 3: Always >= 2 (to distinguish from personal numbers)
- Position 10: Check digit (Luhn algorithm)

### The 12-Digit Convention

The "16" prefix (e.g., `16NNNNNNNNNN`) is **not an official standard** and stems from legacy IT systems using "16" as a placeholder century.

**Civitas-ID implementation:**
- **Input**: Accepts both 10-digit (`556012-3456`) and 12-digit (`165560123456`) for legacy compatibility
- **Output**: Always returns the official 10-digit format

```typescript
// Both inputs work
const org1 = OrganisationId.parseOrThrow("556012-3456");   // 10-digit
const org2 = OrganisationId.parseOrThrow("165560123456");   // 12-digit legacy

// Output is always 10-digit
org1.longFormat();              // "5560123456"
org2.longFormat();              // "5560123456"
org1.longFormatWithSeparator(); // "556012-3456"
org2.longFormatWithSeparator(); // "556012-3456"
```

## Organisation Forms

The library supports all 33 official Swedish organisation forms. The organisation form is automatically extracted from the first two digits of the organisation number.

| Code | Organisation Form (Swedish) | Description |
|------|----------------------------|-------------|
| **0** | **Ingen organisationsform** | **Physical person (not a legal entity)** |
| 21 | Enkla bolag | Simple companies |
| 22 | Partrederier | Shipping partnerships |
| 31 | Handelsbolag, kommanditbolag | Trading partnerships, limited partnerships |
| 32 | Gruvbolag | Mining companies |
| 41 | Bankaktiebolag | Banking companies |
| 42 | Forsakringsaktiebolag | Insurance companies |
| 43 | Europabolag | European companies (SE) |
| 49 | Ovriga aktiebolag | Other limited companies *(most common)* |
| 51 | Ekonomiska foreningar | Economic associations |
| 53 | Bostadsrattsforeningar | Tenant-ownership associations |
| 54 | Kooperativ Hyresrattsforening | Cooperative rental associations |
| 55 | Europakooperativ, EGTS och Eric-konsortier | European cooperatives, EGTC, Eric consortia |
| 61 | Ideella foreningar | Non-profit associations |
| 62 | Samfalligheter | Joint property management associations |
| 63 | Registrerat trossamfund | Registered religious communities |
| 71 | Familjestiftelser | Family foundations |
| 72 | Ovriga stiftelser och fonder | Other foundations and funds |
| 81 | Statliga enheter | State entities |
| 82 | Kommuner | Municipalities |
| 83 | Kommunalforbund | Municipal federations |
| 84 | Regioner | Regions |
| 85 | Allmanna forsakringskassor | General insurance funds |
| 87 | Offentliga korporationer och anstalter | Public corporations and agencies |
| 88 | Hypoteksforeningar | Mortgage associations |
| 89 | Regionala statliga myndigheter | Regional state authorities |
| 91 | Oskiftade dodsbon | Undivided estates |
| 92 | Omsesidiga forsakringsbolag | Mutual insurance companies |
| 93 | Sparbanker | Savings banks |
| 94 | Understodsforeningar och Forsakringsforeningar | Benefit societies and insurance associations |
| 95 | Arbetsloshetskassor | Unemployment insurance funds |
| 96 | Utlandska juridiska personer | Foreign legal entities |
| 98 | Ovriga svenska juridiska personer | Other Swedish legal entities (special legislation) |
| 99 | Juridisk form ej utredd | Legal form not determined |

**Total: 34 forms** (1 physical person code + 33 legal entity forms)

**Source:** Swedish Companies Registration Office ([Bolagsverket](https://bolagsverket.se))

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Official References

- **Skatteverket (Swedish Tax Agency)**: [https://www.skatteverket.se](https://www.skatteverket.se)
- **Bolagsverket (Companies Registration Office)**: [https://www.bolagsverket.se](https://www.bolagsverket.se)
- **SCB (Statistics Sweden)**: [https://www.scb.se](https://www.scb.se)
