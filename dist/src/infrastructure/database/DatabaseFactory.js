import { Pool } from 'pg';
import { PgUnitOfWork } from '../persistence/postgres/PgUnitOfWork';
import { config } from '@composition/config';
export const getDatabaseUrl = () => config.DATABASE_URL;
export const createPool = () => {
    return new Pool({
        connectionString: getDatabaseUrl(),
    });
};
export const createUnitOfWork = (pool) => {
    return new PgUnitOfWork(pool);
};
export const closePool = (pool) => {
    return pool.end();
};
//# sourceMappingURL=DatabaseFactory.js.map