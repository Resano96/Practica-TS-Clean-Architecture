import { Currency, CurrencyCode } from './Currency';
export declare class Money {
    private readonly amountValue;
    private readonly currencyValue;
    private constructor();
    static create(amount: number, currency: Currency | CurrencyCode | string): Money;
    static isValidAmount(value: unknown): value is number;
    get amount(): number;
    get currency(): Currency;
    add(other: Money): Money;
    multiply(multiplier: number): Money;
    equals(other: Money): boolean;
    private static round;
    private static ensureSameCurrency;
}
