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

interface OrdersControllerDeps {
  createOrder: CreateOrder;
  addItemToOrder: AddItemToOrder;
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
  constructor(private readonly deps: OrdersControllerDeps) {}

  registerRoutes(app: FastifyInstance): void {
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
    const result = await this.deps.createOrder.execute(dto);

    if (result.ok) {
      reply.status(201).send({
        message: 'Order created successfully',
        data: result.value,
      });
      return;
    }

    this.handleError(reply, result.error);
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

    const result = await this.deps.addItemToOrder.execute(dto);

    if (result.ok) {
      reply.status(200).send({
        message: 'Item added successfully',
        data: result.value,
      });
      return;
    }

    this.handleError(reply, result.error);
  }

  private handleError(reply: FastifyReply, error: AppError): void {
    const status = this.statusFor(error);
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
