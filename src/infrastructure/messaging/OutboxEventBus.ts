import { randomUUID } from 'node:crypto';
import { EventBus } from '@application/ports/EventBus';
import { DomainEvent } from '@domain/events/DomainEvent';
import { PgClient, PgPool } from '../persistence/postgres/PostgresOrederRepository';

export interface OutboxMessage {
  id: string;
  aggregateType: string;
  aggregateId: string;
  eventType: string;
  payload: unknown;
  createdAt: Date;
}

export class OutboxEventBus implements EventBus {
  constructor(
    private readonly pool: PgPool,
    private readonly transactionalClient?: PgClient,
  ) {}

  async publish(events: DomainEvent[]): Promise<void> {
    if (events.length === 0) {
      return;
    }

    await this.withClient(async (client) => {
      const now = new Date();

      for (const event of events) {
        const aggregateType = this.resolveAggregateType(event);
        const aggregateId = this.resolveAggregateId(event);
        const payload = this.serialize(event);

        await client.query(
          `
            INSERT INTO outbox (id, aggregate_type, aggregate_id, event_type, payload, created_at)
            VALUES ($1, $2, $3, $4, $5::jsonb, $6)
          `,
          [
            randomUUID(),
            aggregateType,
            aggregateId,
            event.name,
            JSON.stringify(payload),
            now,
          ],
        );
      }
    });
  }

  private async withClient<T>(handler: (client: PgClient) => Promise<T>): Promise<T> {
    if (this.transactionalClient) {
      return handler(this.transactionalClient);
    }

    const client = await this.pool.connect();
    try {
      return await handler(client);
    } finally {
      client.release();
    }
  }

  private resolveAggregateType(event: DomainEvent): string {
    if ('aggregateType' in event && typeof (event as any).aggregateType === 'string') {
      return (event as any).aggregateType;
    }

    const [type] = event.name.split('.');
    return type ?? 'unknown';
  }

  private resolveAggregateId(event: DomainEvent): string {
    if ('aggregateId' in event && typeof (event as any).aggregateId === 'string') {
      return (event as any).aggregateId;
    }

    if ('orderId' in event && typeof (event as any).orderId === 'string') {
      return (event as any).orderId;
    }

    throw new Error(`Cannot resolve aggregate id for event ${event.name}`);
  }

  private serialize(event: DomainEvent): Record<string, unknown> {
    const plain: Record<string, unknown> = {};
    for (const key of Object.keys(event)) {
      plain[key] = (event as any)[key];
    }

    plain.occurredOn =
      event.occurredOn instanceof Date
        ? event.occurredOn.toISOString()
        : event.occurredOn;
    plain.name = event.name;

    return plain;
  }
}
