import { AddItemToOrder } from '../application/use-cases/AddItemToOrder';
import { CreateOrder } from '../application/use-cases/CreateOrder';
import { InMemoryOrderRepository } from '../infrastructure/persistence/in-memory/InMemoryOrderRepository';
import { PostgresOrderRepository } from '../infrastructure/persistence/postgres/PostgresOrederRepository';
import { StaticPricingService } from '../infrastructure/http/StaticPricingService';
import { NoopEventBus } from '../infrastructure/messaging/NoopEventBus';
import { PinoLogger } from '../infrastructure/logging/PinoLogger';
import { createPool, closePool, } from '../infrastructure/database/DatabaseFactory';
class SystemClock {
    now() {
        return new Date();
    }
}
export const buildContainer = () => {
    const logger = new PinoLogger();
    const useInMemory = (process.env.USE_INMEMORY ?? 'true').toLowerCase() === 'true';
    let pool = null;
    const orderRepository = useInMemory
        ? new InMemoryOrderRepository()
        : (() => {
            pool = createPool();
            return new PostgresOrderRepository(pool);
        })();
    logger.info(useInMemory
        ? 'Using in-memory order repository'
        : 'Using PostgreSQL order repository');
    const pricingService = new StaticPricingService({
        'SKU-ABC': { amount: 10, currency: 'USD' },
        'SKU-XYZ': { amount: 25, currency: 'USD' },
    });
    const eventBus = new NoopEventBus();
    const clock = new SystemClock();
    const createOrder = new CreateOrder(orderRepository, pricingService, eventBus, clock);
    const addItemToOrder = new AddItemToOrder(orderRepository, pricingService, eventBus);
    const shutdown = async () => {
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
//# sourceMappingURL=container.js.map