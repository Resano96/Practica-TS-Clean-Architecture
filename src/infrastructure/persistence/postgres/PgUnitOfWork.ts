import { OrderRepository } from '@application/ports/OrderRepository';
import { PgPool, PostgresOrderRepository } from './PostgresOrederRepository';

export interface UnitOfWorkRepositories {
  orders: OrderRepository;
}

export class PgUnitOfWork {
  constructor(private readonly pool: PgPool) {}

  async run<T>(handler: (repos: UnitOfWorkRepositories) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    let transactionActive = false;

    try {
      await client.query('BEGIN');
      transactionActive = true;

      const repositories: UnitOfWorkRepositories = {
        orders: new PostgresOrderRepository(this.pool, client),
      };

      const result = await handler(repositories);

      await client.query('COMMIT');
      transactionActive = false;

      return result;
    } catch (error) {
      if (transactionActive) {
        try {
          await client.query('ROLLBACK');
        } catch {
          // ignore rollback failure to preserve original error
        }
      }
      throw error;
    } finally {
      client.release();
    }
  }
}
