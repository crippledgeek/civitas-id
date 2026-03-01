import type { OfficialId } from "./official-id.js";
import type { ValidationResult } from "./validation-result.js";

export interface IdValidator<T extends OfficialId> {
  isValid(input: string): boolean;
  isValid(id: T): boolean;
  validate(input: string): ValidationResult;
}
