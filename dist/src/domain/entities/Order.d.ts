import { DomainEvent } from '../events/DomainEvent';
import { Money } from '../value-objects/Money';
import { OrderItem } from '../value-objects/OrderItem';
import { Quantity } from '../value-objects/Quantity';
import { SKU } from '../value-objects/SKU';
interface AddOrderItemParams {
    sku: SKU;
    unitPrice: Money;
    quantity: Quantity;
}
export declare class Order {
    private readonly props;
    private readonly items;
    private readonly domainEvents;
    private constructor();
    static create(params: {
        id: string;
        customerId: string;
        createdAt: Date;
        items?: OrderItem[];
    }): Order;
    get id(): string;
    get customerId(): string;
    get createdAt(): Date;
    addItem(params: AddOrderItemParams): void;
    itemsList(): OrderItem[];
    totalsByCurrency(): Map<string, number>;
    pullDomainEvents(): DomainEvent[];
    private recalculateTotals;
    private computeTotals;
    private record;
    private static ensureId;
    private static ensureCustomerId;
}
export {};
