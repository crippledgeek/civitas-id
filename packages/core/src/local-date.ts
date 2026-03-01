export class LocalDate {
  private constructor(
    readonly year: number,
    readonly month: number,
    readonly day: number,
  ) {}

  static of(year: number, month: number, day: number): LocalDate {
    return new LocalDate(year, month, day);
  }

  static now(clock?: () => LocalDate): LocalDate {
    if (clock) return clock();
    const d = new Date();
    return new LocalDate(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
  }

  static parse(iso: string): LocalDate {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
    if (!match) throw new Error(`Invalid ISO date string: ${iso}`);
    return new LocalDate(Number(match[1]), Number(match[2]), Number(match[3]));
  }

  age(reference?: LocalDate): number {
    const ref = reference ?? LocalDate.now();
    let years = ref.year - this.year;
    if (ref.month < this.month || (ref.month === this.month && ref.day < this.day)) {
      years--;
    }
    return Math.max(0, years);
  }

  isValid(): boolean {
    if (this.month < 1 || this.month > 12 || this.day < 1 || this.year < 1) return false;
    const maxDay = new Date(this.year, this.month, 0).getDate();
    return this.day <= maxDay;
  }

  toString(): string {
    return `${String(this.year).padStart(4, "0")}-${String(this.month).padStart(2, "0")}-${String(this.day).padStart(2, "0")}`;
  }

  equals(other: LocalDate): boolean {
    return this.year === other.year && this.month === other.month && this.day === other.day;
  }
}
