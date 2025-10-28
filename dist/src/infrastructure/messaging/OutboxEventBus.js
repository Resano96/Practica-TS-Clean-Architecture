import { randomUUID } from 'node:crypto';
export class OutboxEventBus {
    pool;
    transactionalClient;
    constructor(pool, transactionalClient) {
        this.pool = pool;
        this.transactionalClient = transactionalClient;
    }
    async publish(events) {
        if (events.length === 0) {
            return;
        }
        await this.withClient(async (client) => {
            const now = new Date();
            for (const event of events) {
                const aggregateType = this.resolveAggregateType(event);
                const aggregateId = this.resolveAggregateId(event);
                const payload = this.serialize(event);
                await client.query(`
            INSERT INTO outbox (id, aggregate_type, aggregate_id, event_type, payload, created_at)
            VALUES ($1, $2, $3, $4, $5::jsonb, $6)
          `, [
                    randomUUID(),
                    aggregateType,
                    aggregateId,
                    event.name,
                    JSON.stringify(payload),
                    now,
                ]);
            }
        });
    }
    async withClient(handler) {
        if (this.transactionalClient) {
            return handler(this.transactionalClient);
        }
        const client = await this.pool.connect();
        try {
            return await handler(client);
        }
        finally {
            client.release();
        }
    }
    resolveAggregateType(event) {
        if ('aggregateType' in event && typeof event.aggregateType === 'string') {
            return event.aggregateType;
        }
        const [type] = event.name.split('.');
        return type ?? 'unknown';
    }
    resolveAggregateId(event) {
        if ('aggregateId' in event && typeof event.aggregateId === 'string') {
            return event.aggregateId;
        }
        if ('orderId' in event && typeof event.orderId === 'string') {
            return event.orderId;
        }
        throw new Error(`Cannot resolve aggregate id for event ${event.name}`);
    }
    serialize(event) {
        const plain = {};
        for (const key of Object.keys(event)) {
            plain[key] = event[key];
        }
        plain.occurredOn =
            event.occurredOn instanceof Date
                ? event.occurredOn.toISOString()
                : event.occurredOn;
        plain.name = event.name;
        return plain;
    }
}
//# sourceMappingURL=OutboxEventBus.js.map