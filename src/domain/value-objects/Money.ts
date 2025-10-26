import { Currency, CurrencyCode } from './Currency';

const INVALID_AMOUNT_MESSAGE = 'Money amount must be a finite number';
const FRACTION_DIGITS = 2;

export class Money {
  private constructor(
    private readonly amountValue: number,
    private readonly currencyValue: Currency,
  ) {}

  static create(amount: number, currency: Currency | CurrencyCode | string): Money {
    if (!Money.isValidAmount(amount)) {
      throw new Error(INVALID_AMOUNT_MESSAGE);
    }

    const currencyVo =
      currency instanceof Currency ? currency : Currency.create(currency);

    return new Money(Money.round(amount), currencyVo);
  }

  static isValidAmount(value: unknown): value is number {
    return typeof value === 'number' && Number.isFinite(value);
  }

  get amount(): number {
    return this.amountValue;
  }

  get currency(): Currency {
    return this.currencyValue;
  }

  add(other: Money): Money {
    Money.ensureSameCurrency(this, other);
    return new Money(
      Money.round(this.amountValue + other.amountValue),
      this.currencyValue,
    );
  }

  multiply(multiplier: number): Money {
    if (!Money.isValidAmount(multiplier)) {
      throw new Error('Multiplier must be a finite number');
    }

    return new Money(
      Money.round(this.amountValue * multiplier),
      this.currencyValue,
    );
  }

  equals(other: Money): boolean {
    return (
      this.currencyValue.equals(other.currencyValue) &&
      this.amountValue === other.amountValue
    );
  }

  private static round(value: number): number {
    return Number(value.toFixed(FRACTION_DIGITS));
  }

  private static ensureSameCurrency(a: Money, b: Money): void {
    if (!a.currencyValue.equals(b.currencyValue)) {
      throw new Error('Cannot combine money in different currencies');
    }
  }
}
