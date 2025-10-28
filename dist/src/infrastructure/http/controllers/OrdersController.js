import { randomUUID } from 'node:crypto';
export class OrdersController {
    deps;
    logger;
    constructor(deps) {
        this.deps = deps;
        this.logger = deps.logger.child({ component: 'OrdersController' });
        this.logger.info('OrdersController initialized');
    }
    registerRoutes(app) {
        this.logger.info('Registering order routes');
        app.post('/orders', (req, reply) => this.handleCreateOrder(req, reply));
        app.post('/orders/:orderId/items', (req, reply) => this.handleAddItem(req, reply));
    }
    async handleCreateOrder(request, reply) {
        const dto = request.body;
        const log = this.logger.child({
            requestId: randomUUID(),
            route: 'POST /orders',
            customerId: dto.customerId,
        });
        log.info('Received request to create order', { payload: dto });
        const result = await this.deps.createOrder.execute(dto);
        if (result.ok) {
            log.info('Order created successfully', { orderId: result.value.orderId });
            reply.status(201).send({
                message: 'Order created successfully',
                data: result.value,
            });
            return;
        }
        this.handleError(reply, result.error, log);
    }
    async handleAddItem(request, reply) {
        const dto = {
            orderId: request.params.orderId,
            sku: request.body.sku,
            quantity: request.body.quantity,
        };
        const log = this.logger.child({
            requestId: randomUUID(),
            route: 'POST /orders/:orderId/items',
            orderId: dto.orderId,
            sku: dto.sku,
        });
        log.info('Received request to add item to order', { payload: dto });
        const result = await this.deps.addItemToOrder.execute(dto);
        if (result.ok) {
            log.info('Item added successfully', {
                orderId: result.value.orderId,
                sku: dto.sku,
                quantity: dto.quantity,
            });
            reply.status(200).send({
                message: 'Item added successfully',
                data: result.value,
            });
            return;
        }
        this.handleError(reply, result.error, log);
    }
    handleError(reply, error, log) {
        const status = this.statusFor(error);
        (log ?? this.logger).info('Order operation failed', {
            status,
            error: error.message,
            type: error.type,
        });
        reply.status(status).send({
            message: error.message,
            type: error.type,
        });
    }
    statusFor(error) {
        switch (error.type) {
            case 'validation':
                return 400;
            case 'not_found':
                return 404;
            case 'conflict':
                return 409;
            case 'infra':
            default:
                return 502;
        }
    }
}
//# sourceMappingURL=OrdersController.js.map