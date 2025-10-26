export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'JPY';

const ALLOWED_CURRENCIES: CurrencyCode[] = ['USD', 'EUR', 'GBP', 'JPY'];
const INVALID_CURRENCY_MESSAGE =
  'Currency must be one of USD, EUR, GBP or JPY';

export class Currency {
  private constructor(private readonly codeValue: CurrencyCode) {}

  static create(code: string): Currency {
    if (!Currency.isValid(code)) {
      throw new Error(INVALID_CURRENCY_MESSAGE);
    }

    return new Currency(code.toUpperCase() as CurrencyCode);
  }

  static isValid(value: unknown): value is CurrencyCode {
    return (
      typeof value === 'string' &&
      ALLOWED_CURRENCIES.includes(value.toUpperCase() as CurrencyCode)
    );
  }

  get code(): CurrencyCode {
    return this.codeValue;
  }

  equals(other: Currency): boolean {
    return this.codeValue === other.codeValue;
  }
}
