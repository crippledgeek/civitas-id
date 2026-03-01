export interface ChecksumAlgorithm {
  calculateCheckDigit(input: string, maxDigits?: number): number;
  isChecksumValid(input: string, maxDigits?: number): boolean;
  getAlgorithmName(): string;
}
