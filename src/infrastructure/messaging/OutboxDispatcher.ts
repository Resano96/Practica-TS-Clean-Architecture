import { PgPool } from '../persistence/postgres/PostgresOrederRepository';
import { OutboxMessage } from './OutboxEventBus';

type OutboxRow = {
  id: string;
  aggregate_type: string;
  aggregate_id: string;
  event_type: string;
  payload: unknown;
  created_at: Date | string;
};

export interface OutboxDispatcherOptions {
  intervalMs?: number;
  batchSize?: number;
}

export type OutboxProcessor = (message: OutboxMessage) => Promise<void>;

export class OutboxDispatcher {
  private readonly intervalMs: number;
  private readonly batchSize: number;
  private running = false;
  private timer?: NodeJS.Timeout;
  private processing = false;

  constructor(
    private readonly pool: PgPool,
    private readonly processor: OutboxProcessor,
    options: OutboxDispatcherOptions = {},
  ) {
    this.intervalMs = options.intervalMs ?? 5000;
    this.batchSize = options.batchSize ?? 50;
  }

  start(): void {
    if (this.running) {
      return;
    }

    this.running = true;
    void this.tick();
  }

  stop(): void {
    this.running = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }
  }

  private async tick(): Promise<void> {
    if (!this.running || this.processing) {
      return;
    }

    this.processing = true;
    try {
      while (this.running) {
        const processed = await this.processBatch();
        if (processed === 0) {
          break;
        }
      }
    } catch (error) {
      console.error('[outbox] Error dispatching events', error);
    } finally {
      this.processing = false;
      if (this.running) {
        this.timer = setTimeout(() => {
          void this.tick();
        }, this.intervalMs);
      }
    }
  }

  private async processBatch(): Promise<number> {
    const client = await this.pool.connect();
    let transactionActive = false;

    try {
      await client.query('BEGIN');
      transactionActive = true;

      const result = await client.query<OutboxRow>(
        `
          SELECT id, aggregate_type, aggregate_id, event_type, payload, created_at
          FROM outbox
          WHERE published_at IS NULL
          ORDER BY created_at ASC
          FOR UPDATE SKIP LOCKED
          LIMIT $1
        `,
        [this.batchSize],
      );

      if (result.rows.length === 0) {
        await client.query('COMMIT');
        transactionActive = false;
        return 0;
      }

      for (const row of result.rows) {
        const message: OutboxMessage = {
          id: row.id,
          aggregateType: row.aggregate_type,
          aggregateId: row.aggregate_id,
          eventType: row.event_type,
          payload:
            typeof row.payload === 'string'
              ? JSON.parse(row.payload as string)
              : row.payload,
          createdAt: new Date(row.created_at),
        };

        await this.processor(message);

        await client.query('UPDATE outbox SET published_at = NOW() WHERE id = $1', [
          row.id,
        ]);
      }

      await client.query('COMMIT');
      transactionActive = false;

      return result.rows.length;
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
