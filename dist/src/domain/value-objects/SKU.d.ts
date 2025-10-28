export declare class SKU {
    private readonly valueInternal;
    private constructor();
    static create(value: string): SKU;
    static isValid(value: unknown): value is string;
    get value(): string;
    equals(other: SKU): boolean;
}
