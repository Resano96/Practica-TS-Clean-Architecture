import { describe, expect, it } from 'vitest';
import { OutboxEventBus } from '@infrastructure/messaging/OutboxEventBus';
import { PgClient, PgPool } from '@infrastructure/persistence/postgres/PostgresOrederRepository';
import { OrderCreatedEvent } from '@domain/events/OrderCreatedEvent';
import { OrderItemAddedEvent } from '@domain/events/OrderItemAddedEvent';
import { OrderTotalsRecalculatedEvent } from '@domain/events/OrderTotalsRecalculatedEvent';
import { Money } from '@domain/value-objects/Money';
import { Quantity } from '@domain/value-objects/Quantity';
import { SKU } from '@domain/value-objects/SKU';

class FakeClient implements PgClient {
  public readonly queries: { text: string; params?: unknown[] }[] = [];
  public released = false;

  async query<T = unknown>(text: string, params?: unknown[]): Promise<{ rows: T[] }> {
    this.queries.push({ text, params });
    return { rows: [] };
  }

  release(): void {
    this.released = true;
  }
}

class FakePool implements PgPool {
  constructor(private readonly client: FakeClient) {}

  async connect(): Promise<PgClient> {
    return this.client;
  }

  async query<T = unknown>(): Promise<{ rows: T[] }> {
    throw new Error('Pool.query should not be called in OutboxEventBus');
  }
}

describe('OutboxEventBus', () => {
  it('persists events into the outbox table using the provided pool', async () => {
    const client = new FakeClient();
    const pool = new FakePool(client);
    const eventBus = new OutboxEventBus(pool);

    const orderId = 'ORDER-OUTBOX-TEST';
    const createdAt = new Date('2024-01-01T00:00:00Z');

    const events = [
      new OrderCreatedEvent(orderId, 'CUSTOMER-123', createdAt),
      new OrderItemAddedEvent(
        orderId,
        SKU.create('SKU-ABC'),
        Quantity.create(2),
        Money.create(10, 'USD'),
      ),
      new OrderTotalsRecalculatedEvent(orderId, { USD: 20 }),
    ];

    await eventBus.publish(events);

    expect(client.queries).toHaveLength(events.length);
    client.queries.forEach(({ text, params }) => {
      expect(text).toMatch(/INSERT INTO outbox/i);
      expect(params).toHaveLength(6);
      expect(typeof params?.[0]).toBe('string'); // generated id
      expect(params?.[1]).toBe('order'); // aggregate type
      expect(params?.[2]).toBe(orderId);
      expect(typeof params?.[4]).toBe('string'); // payload JSON
    });
    expect(client.released).toBe(true);
  });
});
