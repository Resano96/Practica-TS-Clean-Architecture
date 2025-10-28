import { OrderRepository } from '@application/ports/OrderRepository';
import { PgPool } from './PostgresOrederRepository';
export interface UnitOfWorkRepositories {
    orders: OrderRepository;
}
export declare class PgUnitOfWork {
    private readonly pool;
    constructor(pool: PgPool);
    run<T>(handler: (repos: UnitOfWorkRepositories) => Promise<T>): Promise<T>;
}
