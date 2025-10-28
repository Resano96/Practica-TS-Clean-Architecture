export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'JPY';
export declare class Currency {
    private readonly codeValue;
    private constructor();
    static create(code: string): Currency;
    static isValid(value: unknown): value is CurrencyCode;
    get code(): CurrencyCode;
    equals(other: Currency): boolean;
}
