import { PostgresOrderRepository } from './PostgresOrederRepository';
export class PgUnitOfWork {
    pool;
    constructor(pool) {
        this.pool = pool;
    }
    async run(handler) {
        const client = await this.pool.connect();
        let transactionActive = false;
        try {
            await client.query('BEGIN');
            transactionActive = true;
            const repositories = {
                orders: new PostgresOrderRepository(this.pool, client),
            };
            const result = await handler(repositories);
            await client.query('COMMIT');
            transactionActive = false;
            return result;
        }
        catch (error) {
            if (transactionActive) {
                try {
                    await client.query('ROLLBACK');
                }
                catch {
                    // ignore rollback failure to preserve original error
                }
            }
            throw error;
        }
        finally {
            client.release();
        }
    }
}
//# sourceMappingURL=PgUnitOfWork.js.map