import { AddItemToOrder } from '../application/use-cases/AddItemToOrder';
import { CreateOrder } from '../application/use-cases/CreateOrder';
import { OrderRepository } from '../application/ports/OrderRepository';
import { PricingService } from '../application/ports/PricingService';
import { EventBus } from '../application/ports/EventBus';
import { Clock } from '../application/ports/Clock';
import { InMemoryOrderRepository } from '../infrastructure/persistence/in-memory/InMemoryOrderRepository';
import { PostgresOrderRepository } from '../infrastructure/persistence/postgres/PostgresOrederRepository';
import { StaticPricingService } from '../infrastructure/http/StaticPricingService';
import { NoopEventBus } from '../infrastructure/messaging/NoopEventBus';
import { Logger } from '../application/ports/Logger';
import { PinoLogger } from '../infrastructure/logging/PinoLogger';
import {
  createPool,
  closePool,
} from '../infrastructure/database/DatabaseFactory';
import type { Pool } from 'pg';

class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}

export interface Container {
  orderRepository: OrderRepository;
  pricingService: PricingService;
  eventBus: EventBus;
  clock: Clock;
  createOrder: CreateOrder;
  addItemToOrder: AddItemToOrder;
  logger: Logger;
  shutdown: () => Promise<void>;
}

export const buildContainer = (): Container => {
  const logger = new PinoLogger();
  const useInMemory =
    (process.env.USE_INMEMORY ?? 'true').toLowerCase() === 'true';

  let pool: Pool | null = null;

  const orderRepository: OrderRepository = useInMemory
    ? new InMemoryOrderRepository()
    : (() => {
        pool = createPool();
        return new PostgresOrderRepository(pool);
      })();
  logger.info(
    useInMemory
      ? 'Using in-memory order repository'
      : 'Using PostgreSQL order repository',
  );

  const pricingService = new StaticPricingService({
    'SKU-ABC': { amount: 10, currency: 'USD' },
    'SKU-XYZ': { amount: 25, currency: 'USD' },
  });
  const eventBus = new NoopEventBus();
  const clock = new SystemClock();

  const createOrder = new CreateOrder(
    orderRepository,
    pricingService,
    eventBus,
    clock,
  );

  const addItemToOrder = new AddItemToOrder(
    orderRepository,
    pricingService,
    eventBus,
  );

  const shutdown = async (): Promise<void> => {
    if (pool) {
      await closePool(pool);
      pool = null;
      logger.info('Database pool closed');
    }
  };

  return {
    orderRepository,
    pricingService,
    eventBus,
    clock,
    createOrder,
    addItemToOrder,
    logger,
    shutdown,
  };
};
