import { AddItemToOrder } from '../application/use-cases/AddItemToOrder';
import { CreateOrder } from '../application/use-cases/CreateOrder';
import { OrderRepository } from '../application/ports/OrderRepository';
import { PricingService } from '../application/ports/PricingService';
import { EventBus } from '../application/ports/EventBus';
import { Clock } from '../application/ports/Clock';
import { Logger } from '../application/ports/Logger';
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
export declare const buildContainer: () => Container;
