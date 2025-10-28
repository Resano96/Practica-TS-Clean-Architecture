import { existsSync, readdirSync, readFileSync } from 'fs';
import { join, resolve } from 'path';
import { Pool } from 'pg';

const migrationsDirectory = resolve(process.cwd(), 'db', 'migrations');
const databaseUrl = resolveDatabaseUrl();

function resolveDatabaseUrl(): string | undefined {
    if (process.env.DATABASE_URL && process.env.DATABASE_URL.length > 0) {
        return process.env.DATABASE_URL;
    }

    const envPath = resolve(process.cwd(), '.env');

    if (!existsSync(envPath)) {
        return undefined;
    }

    const envContent = readFileSync(envPath, 'utf-8');

    for (const line of envContent.split(/\r?\n/)) {
        const trimmed = line.trim();

        if (trimmed === '' || trimmed.startsWith('#')) {
            continue;
        }

        const separatorIndex = trimmed.indexOf('=');

        if (separatorIndex === -1) {
            continue;
        }

        const key = trimmed.slice(0, separatorIndex).trim();
        const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, '');

        if (key === 'DATABASE_URL' && value.length > 0) {
            return value;
        }
    }

    return undefined;
}

if (!databaseUrl) {
    console.error('DATABASE_URL is not defined in the environment. Please set it before running the migration.');
    process.exit(1);
}

if (!existsSync(migrationsDirectory)) {
    console.error(`Migrations directory not found at ${migrationsDirectory}.`);
    process.exit(1);
}

async function migrate() {
    const files = readdirSync(migrationsDirectory)
        .filter(file => file.endsWith('.sql'))
        .sort();

    if (files.length === 0) {
        console.log('No migration files found. Nothing to execute.');
        return;
    }

    const pool = new Pool({ connectionString: databaseUrl });
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        await client.query(`
            CREATE TABLE IF NOT EXISTS schema_migrations (
                filename TEXT PRIMARY KEY,
                executed_at TIMESTAMP NOT NULL DEFAULT NOW()
            )
        `);

        const executedResult = await client.query<{ filename: string }>(
            'SELECT filename FROM schema_migrations'
        );
        const executed = new Set(executedResult.rows.map(row => row.filename));

        const pendingFiles = files.filter(file => !executed.has(file));

        if (pendingFiles.length === 0) {
            console.log('No pending migrations. Database is up to date.');
            await client.query('COMMIT');
            return;
        }

        for (const file of pendingFiles) {
            const filePath = join(migrationsDirectory, file);
            const sql = readFileSync(filePath, 'utf-8');

            console.log(`Running migration ${file}...`);
            await client.query(sql);
            await client.query(
                'INSERT INTO schema_migrations (filename) VALUES ($1)',
                [file]
            );
        }

        await client.query('COMMIT');
        console.log('Migration completed successfully.');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Migration failed:', error);
        process.exitCode = 1;
    } finally {
        client.release();
        await pool.end();
    }
}

migrate().catch(error => {
    console.error('Unexpected migration failure:', error);
    process.exit(1);
});
