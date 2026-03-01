/**
 * Exception thrown when an invalid Swedish ID number is encountered.
 * Used for personal IDs, coordination IDs, and organisation IDs
 * that fail validation or parsing.
 */
export class IllegalIdNumberException extends Error {
  constructor(message: string) {
    super(message);
    this.name = "IllegalIdNumberException";
  }
}
