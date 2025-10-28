
import { Pool } from 'pg';
import { PgUnitOfWork } from '../persistence/postgres/PgUnitOfWork';
import { config } from '@composition/config';

export const getDatabaseUrl = (): string => config.DATABASE_URL;

export const createPool = (): Pool => {
  return new Pool({
    connectionString: getDatabaseUrl(),
  });
};

export const createUnitOfWork = (pool: Pool): PgUnitOfWork => {
  return new PgUnitOfWork(pool);
};

export const closePool = (pool: Pool): Promise<void> => {
  return pool.end();
};
