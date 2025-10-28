import { config } from '@composition/config';
import { closePool, createPool } from '../database/DatabaseFactory';
import { OutboxDispatcher, OutboxProcessor } from './OutboxDispatcher';
import { PinoLogger } from '../logging/PinoLogger';

const logger = new PinoLogger().child({ component: 'OutboxDispatcherWorker' });

const sanitizedDatabaseUrl = config.DATABASE_URL.replace(
  /\/\/([^:]+):([^@]+)@/,
  '//***:***@',
);

logger.info('Starting outbox dispatcher worker', {
  databaseUrl: sanitizedDatabaseUrl,
});

const pool = createPool();

const processor: OutboxProcessor = async (message) => {
  logger.info('Dispatching outbox message', {
    id: message.id,
    eventType: message.eventType,
    aggregateType: message.aggregateType,
    aggregateId: message.aggregateId,
  });
};

const dispatcher = new OutboxDispatcher(pool, processor);
dispatcher.start();
logger.info('Outbox dispatcher worker running');

let shuttingDown = false;

const shutdown = async (signal: string): Promise<void> => {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  logger.info(`Received ${signal}, shutting down outbox worker...`);

  try {
    dispatcher.stop();
    await closePool(pool);
    logger.info('Outbox worker shut down gracefully');
  } catch (error) {
    logger.error('Error while shutting down outbox worker', {
      error: error instanceof Error ? error.message : error,
    });
    process.exitCode = 1;
  } finally {
    process.exit();
  }
};

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception in outbox worker', {
    error: error instanceof Error ? error.stack : error,
  });
  void shutdown('uncaughtException');
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection in outbox worker', {
    reason: reason instanceof Error ? reason.stack : reason,
  });
  void shutdown('unhandledRejection');
});
