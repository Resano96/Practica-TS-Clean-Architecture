import { Pool } from 'pg';
import { PgUnitOfWork } from '../persistence/postgres/PgUnitOfWork';
export declare const getDatabaseUrl: () => string;
export declare const createPool: () => Pool;
export declare const createUnitOfWork: (pool: Pool) => PgUnitOfWork;
export declare const closePool: (pool: Pool) => Promise<void>;
