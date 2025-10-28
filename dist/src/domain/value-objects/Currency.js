const ALLOWED_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY'];
const INVALID_CURRENCY_MESSAGE = 'Currency must be one of USD, EUR, GBP or JPY';
export class Currency {
    codeValue;
    constructor(codeValue) {
        this.codeValue = codeValue;
    }
    static create(code) {
        if (!Currency.isValid(code)) {
            throw new Error(INVALID_CURRENCY_MESSAGE);
        }
        return new Currency(code.toUpperCase());
    }
    static isValid(value) {
        return (typeof value === 'string' &&
            ALLOWED_CURRENCIES.includes(value.toUpperCase()));
    }
    get code() {
        return this.codeValue;
    }
    equals(other) {
        return this.codeValue === other.codeValue;
    }
}
//# sourceMappingURL=Currency.js.map