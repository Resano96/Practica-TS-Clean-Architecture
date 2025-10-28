export declare class Quantity {
    private readonly amountValue;
    private constructor();
    static create(value: number): Quantity;
    static isValid(value: unknown): value is number;
    get value(): number;
    add(other: Quantity): Quantity;
    equals(other: Quantity): boolean;
}
