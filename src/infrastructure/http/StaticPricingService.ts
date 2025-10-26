import { PricingService } from '../../application/ports/PricingService';
import { Money } from '../../domain/value-objects/Money';
import { SKU } from '../../domain/value-objects/SKU';

type PriceInput = {
  amount: number;
  currency: string;
};

export class StaticPricingService implements PricingService {
  private readonly table: Map<string, Money>;

  constructor(prices: Record<string, PriceInput> = {}) {
    this.table = new Map(
      Object.entries(prices).map(([sku, price]) => [
        sku.toUpperCase(),
        Money.create(price.amount, price.currency),
      ]),
    );
  }

  async quote(sku: SKU): Promise<Money> {
    const price = this.table.get(sku.value);

    if (!price) {
      throw new Error(`Price not configured for SKU ${sku.value}`);
    }

    return price;
  }

  setPrice(sku: SKU, price: PriceInput): void {
    this.table.set(
      sku.value,
      Money.create(price.amount, price.currency),
    );
  }
}
