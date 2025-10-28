import { describe, expect, it, vi, beforeEach } from 'vitest';
import { InMemoryOrderRepository } from '@infrastructure/persistence/in-memory/InMemoryOrderRepository';
import { StaticPricingService } from '@infrastructure/http/StaticPricingService';
import { CreateOrder } from '@application/use-cases/CreateOrder';
import { AddItemToOrder } from '@application/use-cases/AddItemToOrder';
import { CreateOrderDTO } from '@application/dto/CreateOrderDTO';
import { EventBus } from '@application/ports/EventBus';
import { DomainEvent } from '@domain/events/DomainEvent';
import { Clock } from '@application/ports/Clock';

class RecordingEventBus implements EventBus {
  public published: DomainEvent[] = [];

  async publish(events: DomainEvent[]): Promise<void> {
    this.published.push(...events);
  }
}

class FixedClock implements Clock {
  constructor(private readonly fixed: Date) {}

  now(): Date {
    return this.fixed;
  }
}

describe('CreateOrder use case', () => {
  const pricing = new StaticPricingService({
    'SKU-ABC': { amount: 10, currency: 'USD' },
    'SKU-XYZ': { amount: 25, currency: 'USD' },
  });

  let eventBus: RecordingEventBus;
  let repository: InMemoryOrderRepository;
  let clock: FixedClock;
  let createOrder: CreateOrder;

  beforeEach(() => {
    eventBus = new RecordingEventBus();
    repository = new InMemoryOrderRepository();
    clock = new FixedClock(new Date('2024-01-01T00:00:00Z'));
    createOrder = new CreateOrder(repository, pricing, eventBus, clock);
  });

  const basePayload = (): CreateOrderDTO => ({
    orderId: 'ORDER-001',
    customerId: 'CUSTOMER-123',
    items: [
      { sku: 'SKU-ABC', quantity: 2 },
      { sku: 'SKU-XYZ', quantity: 1 },
    ],
  });

  it('creates an order when an id is provided', async () => {
    const result = await createOrder.execute(basePayload());

    expect(result.ok).toBe(true);
    const stored = await repository.findById('ORDER-001');
    expect(stored).not.toBeNull();
    expect(stored?.itemsList()).toHaveLength(2);
    expect(eventBus.published.map((event) => event.name)).toEqual(
      expect.arrayContaining([
        'order.created',
        'order.item_added',
        'order.totals_recalculated',
      ]),
    );
  });

  it('generates a unique order id when none is provided', async () => {
    const payload: CreateOrderDTO = {
      customerId: 'CUSTOMER-456',
      items: [{ sku: 'SKU-ABC', quantity: 1 }],
    };

    const result = await createOrder.execute(payload);

    expect(result.ok).toBe(true);
    expect(result.value.orderId).toMatch(
      /^[0-9a-fA-F-]{36}$/,
    );
    const stored = await repository.findById(result.value.orderId);
    expect(stored).not.toBeNull();
  });

  it('fails with conflict when the order already exists', async () => {
    await createOrder.execute(basePayload());
    const duplicate = await createOrder.execute(basePayload());

    expect(duplicate.ok).toBe(false);
    expect(duplicate.error.type).toBe('conflict');
  });

  it('validates payload before creating the order', async () => {
    const result = await createOrder.execute({
      customerId: '',
      items: [],
    });

    expect(result.ok).toBe(false);
    expect(result.error.type).toBe('validation');
  });

  it('publishes domain events for each created order', async () => {
    await createOrder.execute(basePayload());

    const names = eventBus.published.map((event) => event.name);
    expect(names.filter((name) => name === 'order.created').length).toBe(1);
    expect(names).toContain('order.item_added');
    expect(names).toContain('order.totals_recalculated');
  });

  it('supports adding items after creation with shared adapters', async () => {
    const addItem = new AddItemToOrder(repository, pricing, eventBus);
    await createOrder.execute(basePayload());

    const addResult = await addItem.execute({
      orderId: 'ORDER-001',
      sku: 'SKU-ABC',
      quantity: 1,
    });

    expect(addResult.ok).toBe(true);
    const stored = await repository.findById('ORDER-001');
    expect(stored).not.toBeNull();
    const items = stored!.itemsList();
    expect(items).toHaveLength(2);
    const skuAbc = items.find((item) => item.sku.value === 'SKU-ABC');
    expect(skuAbc?.quantity.value).toBe(3);
  });
});
