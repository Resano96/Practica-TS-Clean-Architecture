const INVALID_QUANTITY_MESSAGE = 'Quantity must be a positive integer greater than zero';
export class Quantity {
    amountValue;
    constructor(amountValue) {
        this.amountValue = amountValue;
    }
    static create(value) {
        if (!Quantity.isValid(value)) {
            throw new Error(INVALID_QUANTITY_MESSAGE);
        }
        return new Quantity(value);
    }
    static isValid(value) {
        return (typeof value === 'number' &&
            Number.isInteger(value) &&
            Number.isFinite(value) &&
            value > 0);
    }
    get value() {
        return this.amountValue;
    }
    add(other) {
        return new Quantity(this.amountValue + other.amountValue);
    }
    equals(other) {
        return this.amountValue === other.amountValue;
    }
}
//# sourceMappingURL=Quantity.js.map