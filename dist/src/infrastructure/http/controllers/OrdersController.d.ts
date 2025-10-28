import { FastifyInstance } from 'fastify';
import { AddItemToOrder } from '../../../application/use-cases/AddItemToOrder';
import { CreateOrder } from '../../../application/use-cases/CreateOrder';
import { Logger } from '../../../application/ports/Logger';
interface OrdersControllerDeps {
    createOrder: CreateOrder;
    addItemToOrder: AddItemToOrder;
    logger: Logger;
}
export declare class OrdersController {
    private readonly deps;
    private readonly logger;
    constructor(deps: OrdersControllerDeps);
    registerRoutes(app: FastifyInstance): void;
    private handleCreateOrder;
    private handleAddItem;
    private handleError;
    private statusFor;
}
export {};
