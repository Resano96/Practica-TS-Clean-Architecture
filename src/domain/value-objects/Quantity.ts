const INVALID_QUANTITY_MESSAGE =
  'Quantity must be a positive integer greater than zero';

export class Quantity {
  private constructor(private readonly amountValue: number) {}

  static create(value: number): Quantity {
    if (!Quantity.isValid(value)) {
      throw new Error(INVALID_QUANTITY_MESSAGE);
    }

    return new Quantity(value);
  }

  static isValid(value: unknown): value is number {
    return (
      typeof value === 'number' &&
      Number.isInteger(value) &&
      Number.isFinite(value) &&
      value > 0
    );
  }

  get value(): number {
    return this.amountValue;
  }

  add(other: Quantity): Quantity {
    return new Quantity(this.amountValue + other.amountValue);
  }

  equals(other: Quantity): boolean {
    return this.amountValue === other.amountValue;
  }
}
