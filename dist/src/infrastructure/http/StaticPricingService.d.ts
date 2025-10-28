import { PricingService } from '../../application/ports/PricingService';
import { Money } from '../../domain/value-objects/Money';
import { SKU } from '../../domain/value-objects/SKU';
type PriceInput = {
    amount: number;
    currency: string;
};
export declare class StaticPricingService implements PricingService {
    private readonly table;
    constructor(prices?: Record<string, PriceInput>);
    quote(sku: SKU): Promise<Money>;
    setPrice(sku: SKU, price: PriceInput): void;
}
export {};
