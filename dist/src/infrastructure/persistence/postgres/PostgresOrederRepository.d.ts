import { OrderRepository } from '@application/ports/OrderRepository';
import { Order } from '@domain/entities/Order';
type QueryResult<T> = {
    rows: T[];
};
export interface PgClient {
    query<T = unknown>(text: string, params?: unknown[]): Promise<QueryResult<T>>;
    release(): void;
}
export interface PgPool {
    connect(): Promise<PgClient>;
    query<T = unknown>(text: string, params?: unknown[]): Promise<QueryResult<T>>;
}
export declare class PostgresOrderRepository implements OrderRepository {
    private readonly pool;
    private readonly transactionalClient?;
    constructor(pool: PgPool, transactionalClient?: PgClient | undefined);
    private withClient;
    save(order: Order): Promise<void>;
    findById(id: string): Promise<Order | null>;
}
export {};
