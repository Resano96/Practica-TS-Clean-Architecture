import { describe, expect, it } from 'vitest';
import { Order } from '@domain/entities/Order';
import { Money } from '@domain/value-objects/Money';
import { OrderItem } from '@domain/value-objects/OrderItem';
import { Quantity } from '@domain/value-objects/Quantity';
import { SKU } from '@domain/value-objects/SKU';
import { OrderCreatedEvent } from '@domain/events/OrderCreatedEvent';
import { OrderItemAddedEvent } from '@domain/events/OrderItemAddedEvent';
import { OrderTotalsRecalculatedEvent } from '@domain/events/OrderTotalsRecalculatedEvent';

const makeItem = (sku: string, quantity = 1, price = 10) =>
  OrderItem.create({
    sku: SKU.create(sku),
    quantity: Quantity.create(quantity),
    unitPrice: Money.create(price, 'USD'),
  });

describe('Order aggregate', () => {
  it('creates an order and emits creation events', () => {
    const createdAt = new Date('2024-01-01T10:00:00Z');
    const order = Order.create({
      id: 'ORDER-001',
      customerId: 'CUSTOMER-1',
      createdAt,
      items: [makeItem('SKU-ABC', 2, 15)],
    });

    const events = order.pullDomainEvents();

    expect(events).toHaveLength(2);
    expect(events[0]).toBeInstanceOf(OrderCreatedEvent);
    expect(events[1]).toBeInstanceOf(OrderTotalsRecalculatedEvent);
  });

  it('adds items merging quantities by SKU and recalculates totals', () => {
    const order = Order.create({
      id: 'ORDER-002',
      customerId: 'CUSTOMER-1',
      createdAt: new Date(),
    });

    order.addItem({
      sku: SKU.create('SKU-ABC'),
      quantity: Quantity.create(2),
      unitPrice: Money.create(10, 'USD'),
    });
    order.addItem({
      sku: SKU.create('SKU-ABC'),
      quantity: Quantity.create(1),
      unitPrice: Money.create(10, 'USD'),
    });
    order.addItem({
      sku: SKU.create('SKU-XYZ'),
      quantity: Quantity.create(1),
      unitPrice: Money.create(25, 'USD'),
    });

    const items = order.itemsList();
    expect(items).toHaveLength(2);
    const totals = order.totalsByCurrency();
    expect(totals.get('USD')).toBe(55);

    const events = order.pullDomainEvents();
    const itemAddedEvents = events.filter(
      (event): event is OrderItemAddedEvent => event instanceof OrderItemAddedEvent,
    );
    expect(itemAddedEvents).toHaveLength(3);
  });

  it('validates order id and customer id', () => {
    expect(() =>
      Order.create({
        id: '',
        customerId: 'C1',
        createdAt: new Date(),
      }),
    ).toThrow('Order id must be a non-empty string');

    expect(() =>
      Order.create({
        id: 'ORDER-1',
        customerId: '',
        createdAt: new Date(),
      }),
    ).toThrow('Customer id must be a non-empty string');
  });

  it('resets domain events after pulling and handles multi currency totals', () => {
    const order = Order.create({
      id: 'ORDER-003',
      customerId: 'CUSTOMER-1',
      createdAt: new Date(),
    });

    order.pullDomainEvents(); // clear initial events

    order.addItem({
      sku: SKU.create('SKU-USD'),
      quantity: Quantity.create(1),
      unitPrice: Money.create(10, 'USD'),
    });

    order.addItem({
      sku: SKU.create('SKU-EUR'),
      quantity: Quantity.create(2),
      unitPrice: Money.create(5, 'EUR'),
    });

    const events = order.pullDomainEvents();
    expect(events.length).toBeGreaterThan(0);
    expect(order.pullDomainEvents()).toHaveLength(0);

    const totals = order.totalsByCurrency();
    expect(totals.get('USD')).toBe(10);
    expect(totals.get('EUR')).toBe(10);
  });
});
