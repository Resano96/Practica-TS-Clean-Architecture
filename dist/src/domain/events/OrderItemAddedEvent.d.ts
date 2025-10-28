import { Money } from '../value-objects/Money';
import { Quantity } from '../value-objects/Quantity';
import { SKU } from '../value-objects/SKU';
import { DomainEvent } from './DomainEvent';
export declare class OrderItemAddedEvent implements DomainEvent {
    readonly orderId: string;
    readonly sku: SKU;
    readonly quantity: Quantity;
    readonly unitPrice: Money;
    readonly name = "order.item_added";
    readonly occurredOn: Date;
    constructor(orderId: string, sku: SKU, quantity: Quantity, unitPrice: Money, occurredOn?: Date);
}
