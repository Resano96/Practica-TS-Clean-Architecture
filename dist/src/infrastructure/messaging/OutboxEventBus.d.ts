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
export declare class OutboxEventBus implements EventBus {
    private readonly pool;
    private readonly transactionalClient?;
    constructor(pool: PgPool, transactionalClient?: PgClient);
    publish(events: DomainEvent[]): Promise<void>;
    private withClient;
    private resolveAggregateType;
    private resolveAggregateId;
    private serialize;
}
