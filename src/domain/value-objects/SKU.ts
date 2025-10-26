const INVALID_SKU_MESSAGE =
  'SKU must be a non-empty string containing letters, numbers, dashes or underscores';
const SKU_PATTERN = /^[A-Z0-9-_]+$/;

export class SKU {
  private constructor(private readonly valueInternal: string) {}

  static create(value: string): SKU {
    if (!SKU.isValid(value)) {
      throw new Error(INVALID_SKU_MESSAGE);
    }

    return new SKU(value.trim().toUpperCase());
  }

  static isValid(value: unknown): value is string {
    if (typeof value !== 'string') {
      return false;
    }

    const prepared = value.trim().toUpperCase();
    return prepared.length > 0 && SKU_PATTERN.test(prepared);
  }

  get value(): string {
    return this.valueInternal;
  }

  equals(other: SKU): boolean {
    return this.valueInternal === other.valueInternal;
  }
}
