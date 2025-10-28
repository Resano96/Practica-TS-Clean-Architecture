import { Currency } from './Currency';
const INVALID_AMOUNT_MESSAGE = 'Money amount must be a finite number';
const FRACTION_DIGITS = 2;
export class Money {
    amountValue;
    currencyValue;
    constructor(amountValue, currencyValue) {
        this.amountValue = amountValue;
        this.currencyValue = currencyValue;
    }
    static create(amount, currency) {
        if (!Money.isValidAmount(amount)) {
            throw new Error(INVALID_AMOUNT_MESSAGE);
        }
        const currencyVo = currency instanceof Currency ? currency : Currency.create(currency);
        return new Money(Money.round(amount), currencyVo);
    }
    static isValidAmount(value) {
        return typeof value === 'number' && Number.isFinite(value);
    }
    get amount() {
        return this.amountValue;
    }
    get currency() {
        return this.currencyValue;
    }
    add(other) {
        Money.ensureSameCurrency(this, other);
        return new Money(Money.round(this.amountValue + other.amountValue), this.currencyValue);
    }
    multiply(multiplier) {
        if (!Money.isValidAmount(multiplier)) {
            throw new Error('Multiplier must be a finite number');
        }
        return new Money(Money.round(this.amountValue * multiplier), this.currencyValue);
    }
    equals(other) {
        return (this.currencyValue.equals(other.currencyValue) &&
            this.amountValue === other.amountValue);
    }
    static round(value) {
        return Number(value.toFixed(FRACTION_DIGITS));
    }
    static ensureSameCurrency(a, b) {
        if (!a.currencyValue.equals(b.currencyValue)) {
            throw new Error('Cannot combine money in different currencies');
        }
    }
}
//# sourceMappingURL=Money.js.map