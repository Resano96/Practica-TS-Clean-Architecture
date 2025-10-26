import { Money } from '../value-objects/Money';
import { Quantity } from '../value-objects/Quantity';
import { SKU } from '../value-objects/SKU';
import { DomainEvent } from './DomainEvent';

export class OrderItemAddedEvent implements DomainEvent {
  readonly name = 'order.item_added';
  readonly occurredOn: Date;

  constructor(
    public readonly orderId: string,
    public readonly sku: SKU,
    public readonly quantity: Quantity,
    public readonly unitPrice: Money,
    occurredOn?: Date,
  ) {
    this.occurredOn = occurredOn ?? new Date();
  }
}
