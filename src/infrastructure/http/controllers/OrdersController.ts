import { randomUUID } from 'node:crypto';
import {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
} from 'fastify';
import { AddItemToOrderDTO } from '../../../application/dto/AddItemToOrderDTO';
import { CreateOrderDTO } from '../../../application/dto/CreateOrderDTO';
import { AddItemToOrder } from '../../../application/use-cases/AddItemToOrder';
import { CreateOrder } from '../../../application/use-cases/CreateOrder';
import { AppError } from '../../../application/errors';
import { Logger } from '../../../application/ports/Logger';

interface OrdersControllerDeps {
  createOrder: CreateOrder;
  addItemToOrder: AddItemToOrder;
  logger: Logger;
}

interface CreateOrderRequestBody extends CreateOrderDTO {}

interface AddItemParams {
  orderId: string;
}

interface AddItemRequestBody {
  sku: string;
  quantity: number;
}

type CreateOrderRequest = FastifyRequest<{
  Body: CreateOrderRequestBody;
}>;

type AddItemRequest = FastifyRequest<{
  Params: AddItemParams;
  Body: AddItemRequestBody;
}>;

export class OrdersController {
  private readonly logger: Logger;

  constructor(private readonly deps: OrdersControllerDeps) {
    this.logger = deps.logger.child({ component: 'OrdersController' });
    this.logger.info('OrdersController initialized');
  }

  registerRoutes(app: FastifyInstance): void {
    this.logger.info('Registering order routes');
    app.post('/orders', (req, reply) => this.handleCreateOrder(req, reply));
    app.post('/orders/:orderId/items', (req, reply) =>
      this.handleAddItem(req, reply),
    );
  }

  private async handleCreateOrder(
    request: CreateOrderRequest,
    reply: FastifyReply,
  ): Promise<void> {
    const dto: CreateOrderDTO = request.body;
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

  private async handleAddItem(
    request: AddItemRequest,
    reply: FastifyReply,
  ): Promise<void> {
    const dto: AddItemToOrderDTO = {
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

  private handleError(
    reply: FastifyReply,
    error: AppError,
    log?: Logger,
  ): void {
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

  private statusFor(error: AppError): number {
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
