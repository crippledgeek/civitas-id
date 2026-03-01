import type { IdFormat } from "./id-format.js";
import type { LocalDate } from "./local-date.js";
import type { OfficialId } from "./official-id.js";

export interface PersonOfficialId<F extends IdFormat> extends OfficialId<F> {
  getBirthDate(): LocalDate;
  getAge(clock?: () => LocalDate): number;
  isMale(): boolean;
  isFemale(): boolean;
  isAdult(clock?: () => LocalDate): boolean;
  isChild(clock?: () => LocalDate): boolean;
}
