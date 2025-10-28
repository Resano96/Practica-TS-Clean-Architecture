import { EventBus } from '@application/ports/EventBus';
import { OutboxEventBus } from './OutboxEventBus';
import { NoopEventBus } from './NoopEventBus';
import {
  OutboxDispatcher,
  OutboxDispatcherOptions,
  OutboxProcessor,
} from './OutboxDispatcher';
import { createPool, closePool } from '../database/DatabaseFactory';
import { Pool } from 'pg';

export interface MessagingFactoryOptions {
  useOutbox?: boolean;
  dispatcherOptions?: OutboxDispatcherOptions;
}

export class MessagingFactory {
  private pool: Pool | null = null;
  private dispatcher: OutboxDispatcher | null = null;

  constructor(private readonly options: MessagingFactoryOptions = {}) {}

  createEventBus(): EventBus {
    if (!this.options.useOutbox) {
      return new NoopEventBus();
    }

    this.ensurePool();
    return new OutboxEventBus(this.pool!);
  }

  startDispatcher(processor: OutboxProcessor): void {
    if (!this.options.useOutbox) {
      return;
    }

    this.ensurePool();
    if (!this.dispatcher) {
      this.dispatcher = new OutboxDispatcher(
        this.pool!,
        processor,
        this.options.dispatcherOptions,
      );
      this.dispatcher.start();
    }
  }

  async stop(): Promise<void> {
    if (this.dispatcher) {
      this.dispatcher.stop();
      this.dispatcher = null;
    }

    if (this.pool) {
      await closePool(this.pool);
      this.pool = null;
    }
  }

  private ensurePool(): void {
    if (!this.pool) {
      this.pool = createPool();
    }
  }
}
