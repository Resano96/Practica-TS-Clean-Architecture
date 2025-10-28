import { Money } from '../../domain/value-objects/Money';
export class StaticPricingService {
    table;
    constructor(prices = {}) {
        this.table = new Map(Object.entries(prices).map(([sku, price]) => [
            sku.toUpperCase(),
            Money.create(price.amount, price.currency),
        ]));
    }
    async quote(sku) {
        const price = this.table.get(sku.value);
        if (!price) {
            throw new Error(`Price not configured for SKU ${sku.value}`);
        }
        return price;
    }
    setPrice(sku, price) {
        this.table.set(sku.value, Money.create(price.amount, price.currency));
    }
}
//# sourceMappingURL=StaticPricingService.js.map