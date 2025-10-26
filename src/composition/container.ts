import { AddItemToOrder } from '../application/use-cases/AddItemToOrder';
import { CreateOrder } from '../application/use-cases/CreateOrder';
import { OrderRepository } from '../application/ports/OrderRepository';
import { PricingService } from '../application/ports/PricingService';
import { EventBus } from '../application/ports/EventBus';
import { Clock } from '../application/ports/Clock';
import { InMemoryOrderRepository } from '../infrastructure/persistence/in-memory/InMemoryOrderRepository';
import { StaticPricingService } from '../infrastructure/http/StaticPricingService';
import { NoopEventBus } from '../infrastructure/messaging/NoopEventBus';

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
}

export const buildContainer = (): Container => {
  const orderRepository = new InMemoryOrderRepository();
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

  return {
    orderRepository,
    pricingService,
    eventBus,
    clock,
    createOrder,
    addItemToOrder,
  };
};
