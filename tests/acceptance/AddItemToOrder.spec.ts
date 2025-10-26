import { describe, expect, it } from 'vitest';
import { AddItemToOrder } from '@application/use-cases/AddItemToOrder';
import { CreateOrder } from '@application/use-cases/CreateOrder';
import { AddItemToOrderDTO } from '@application/dto/AddItemToOrderDTO';
import { CreateOrderDTO } from '@application/dto/CreateOrderDTO';
import { InMemoryOrderRepository } from '@infrastructure/persistence/in-memory/InMemoryOrderRepository';
import { StaticPricingService } from '@infrastructure/http/StaticPricingService';
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

const setup = () => {
  const repository = new InMemoryOrderRepository();
  const pricing = new StaticPricingService({
    'SKU-ABC': { amount: 10, currency: 'USD' },
    'SKU-XYZ': { amount: 25, currency: 'USD' },
  });
  const eventBus = new RecordingEventBus();
  const clock = new FixedClock(new Date('2024-01-01T00:00:00Z'));

  const createOrder = new CreateOrder(repository, pricing, eventBus, clock);
  const addItemToOrder = new AddItemToOrder(repository, pricing, eventBus);

  return {
    repository,
    pricing,
    eventBus,
    clock,
    createOrder,
    addItemToOrder,
  };
};

describe('AddItemToOrder – acceptance', () => {
  it('adds an item to an existing order using in-memory adapters', async () => {
    const { repository, eventBus, createOrder, addItemToOrder } = setup();

    const createPayload: CreateOrderDTO = {
      orderId: 'ORDER-ACCEPTANCE',
      customerId: 'CUSTOMER-123',
      items: [{ sku: 'SKU-ABC', quantity: 1 }],
    };

    const creationResult = await createOrder.execute(createPayload);
    expect(creationResult.ok).toBe(true);

    const addItemPayload: AddItemToOrderDTO = {
      orderId: 'ORDER-ACCEPTANCE',
      sku: 'SKU-XYZ',
      quantity: 2,
    };

    const result = await addItemToOrder.execute(addItemPayload);

    expect(result.ok).toBe(true);
    expect(result.value.orderId).toBe('ORDER-ACCEPTANCE');

    const storedOrder = await repository.findById('ORDER-ACCEPTANCE');
    expect(storedOrder).not.toBeNull();
    expect(storedOrder?.itemsList()).toHaveLength(2);

    const totals = storedOrder?.totalsByCurrency();
    expect(totals?.get('USD')).toBe(60); // 1*10 + 2*25

    const addedEvents = eventBus.published.filter(
      (event) => event.name === 'order.item_added',
    );
    expect(addedEvents.length).toBeGreaterThan(0);
  });

  it('returns not found result when order does not exist', async () => {
    const { addItemToOrder } = setup();

    const result = await addItemToOrder.execute({
      orderId: 'UNKNOWN',
      sku: 'SKU-ABC',
      quantity: 1,
    });

    expect(result.ok).toBe(false);
    expect(result.error.type).toBe('not_found');
  });

  it('validates payload before hitting adapters', async () => {
    const { addItemToOrder } = setup();

    const result = await addItemToOrder.execute({
      orderId: '',
      sku: '',
      quantity: 0,
    });

    expect(result.ok).toBe(false);
    expect(result.error.type).toBe('validation');
  });
});
