const INVALID_SKU_MESSAGE = 'SKU must be a non-empty string containing letters, numbers, dashes or underscores';
const SKU_PATTERN = /^[A-Z0-9-_]+$/;
export class SKU {
    valueInternal;
    constructor(valueInternal) {
        this.valueInternal = valueInternal;
    }
    static create(value) {
        if (!SKU.isValid(value)) {
            throw new Error(INVALID_SKU_MESSAGE);
        }
        return new SKU(value.trim().toUpperCase());
    }
    static isValid(value) {
        if (typeof value !== 'string') {
            return false;
        }
        const prepared = value.trim().toUpperCase();
        return prepared.length > 0 && SKU_PATTERN.test(prepared);
    }
    get value() {
        return this.valueInternal;
    }
    equals(other) {
        return this.valueInternal === other.valueInternal;
    }
}
//# sourceMappingURL=SKU.js.map