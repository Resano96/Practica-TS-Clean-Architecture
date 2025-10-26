import { DomainEvent } from '../events/DomainEvent';
import { OrderCreatedEvent } from '../events/OrderCreatedEvent';
import { OrderItemAddedEvent } from '../events/OrderItemAddedEvent';
import { OrderTotalsRecalculatedEvent } from '../events/OrderTotalsRecalculatedEvent';
import { Money } from '../value-objects/Money';
import { OrderItem } from '../value-objects/OrderItem';
import { Quantity } from '../value-objects/Quantity';
import { SKU } from '../value-objects/SKU';

interface OrderProps {
  id: string;
  customerId: string;
  items: OrderItem[];
  createdAt: Date;
}

interface AddOrderItemParams {
  sku: SKU;
  unitPrice: Money;
  quantity: Quantity;
}

const INVALID_ORDER_ID_MESSAGE = 'Order id must be a non-empty string';
const INVALID_CUSTOMER_ID_MESSAGE = 'Customer id must be a non-empty string';

export class Order {
  private readonly items: Map<string, OrderItem>;
  private readonly domainEvents: DomainEvent[] = [];

  private constructor(private readonly props: OrderProps) {
    this.items = new Map(
      (props.items ?? []).map((item) => [item.sku.value, item]),
    );
  }

  static create(params: {
    id: string;
    customerId: string;
    createdAt: Date;
    items?: OrderItem[];
  }): Order {
    Order.ensureId(params.id);
    Order.ensureCustomerId(params.customerId);

    const order = new Order({
      id: params.id,
      customerId: params.customerId,
      items: params.items ?? [],
      createdAt: params.createdAt,
    });

    order.record(new OrderCreatedEvent(params.id, params.customerId, params.createdAt));
    order.recalculateTotals();

    return order;
  }

  get id(): string {
    return this.props.id;
  }

  get customerId(): string {
    return this.props.customerId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  addItem(params: AddOrderItemParams): void {
    const key = params.sku.value;
    const existing = this.items.get(key);
    const nextItem = existing
      ? existing.addQuantity(params.quantity)
      : OrderItem.create({
          sku: params.sku,
          unitPrice: params.unitPrice,
          quantity: params.quantity,
        });

    this.items.set(key, nextItem);

    this.record(
      new OrderItemAddedEvent(
        this.props.id,
        params.sku,
        params.quantity,
        params.unitPrice,
      ),
    );

    this.recalculateTotals();
  }

  itemsList(): OrderItem[] {
    return Array.from(this.items.values());
  }

  totalsByCurrency(): Map<string, number> {
    return new Map(Object.entries(this.computeTotals()));
  }

  pullDomainEvents(): DomainEvent[] {
    const events = [...this.domainEvents];
    this.domainEvents.length = 0;
    return events;
  }

  private recalculateTotals(): void {
    const totals = this.computeTotals();
    this.record(new OrderTotalsRecalculatedEvent(this.props.id, totals));
  }

  private computeTotals(): Record<string, number> {
    const totals: Record<string, number> = {};

    for (const item of this.items.values()) {
      const total = item.total();
      const currency = total.currency.code;
      totals[currency] = Number(
        ((totals[currency] ?? 0) + total.amount).toFixed(2),
      );
    }

    return totals;
  }

  private record(event: DomainEvent): void {
    this.domainEvents.push(event);
  }

  private static ensureId(value: string): void {
    if (!value || typeof value !== 'string' || !value.trim()) {
      throw new Error(INVALID_ORDER_ID_MESSAGE);
    }
  }

  private static ensureCustomerId(value: string): void {
    if (!value || typeof value !== 'string' || !value.trim()) {
      throw new Error(INVALID_CUSTOMER_ID_MESSAGE);
    }
  }
}
