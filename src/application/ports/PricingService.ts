import { Money } from '../../domain/value-objects/Money';
import { SKU } from '../../domain/value-objects/SKU';

export interface PricingService {
  quote(sku: SKU): Promise<Money>;
}
