/**
 * Error thrown when an invalid Swedish ID number is encountered.
 * Used for personal IDs, coordination IDs, and organisation IDs
 * that fail validation or parsing.
 */
export class InvalidIdNumberError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "InvalidIdNumberError";
  }
}
