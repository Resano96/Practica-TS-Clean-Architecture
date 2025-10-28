import { PgPool } from '../persistence/postgres/PostgresOrederRepository';
import { OutboxMessage } from './OutboxEventBus';
export interface OutboxDispatcherOptions {
    intervalMs?: number;
    batchSize?: number;
}
export type OutboxProcessor = (message: OutboxMessage) => Promise<void>;
export declare class OutboxDispatcher {
    private readonly pool;
    private readonly processor;
    private readonly intervalMs;
    private readonly batchSize;
    private running;
    private timer?;
    private processing;
    constructor(pool: PgPool, processor: OutboxProcessor, options?: OutboxDispatcherOptions);
    start(): void;
    stop(): void;
    private tick;
    private processBatch;
}
