import { Order } from '../../domain/entities/Order';
import { OrderItem } from '../../domain/value-objects/OrderItem';
import { Quantity } from '../../domain/value-objects/Quantity';
import { SKU } from '../../domain/value-objects/SKU';
import { fail, ok, Result } from '../../shared/Result';
import {
  AppError,
  ConflictError,
  ValidationError,
  toAppError,
} from '../errors';
import { CreateOrderDTO } from '../dto/CreateOrderDTO';
import { Clock } from '../ports/Clock';
import { EventBus } from '../ports/EventBus';
import { OrderRepository } from '../ports/OrderRepository';
import { PricingService } from '../ports/PricingService';

type CreateOrderResult = Result<{ orderId: string }, AppError>;

export class CreateOrder {
  constructor(
    private readonly repository: OrderRepository,
    private readonly pricingService: PricingService,
    private readonly eventBus: EventBus,
    private readonly clock: Clock,
  ) {}

  async execute(dto: CreateOrderDTO): Promise<CreateOrderResult> {
    try {
      const validationError = this.validate(dto);
      if (validationError) {
        return fail(validationError);
      }

      const existing = await this.repository.findById(dto.orderId.trim());
      if (existing) {
        return fail(new ConflictError('Order already exists'));
      }

      const order = Order.create({
        id: dto.orderId.trim(),
        customerId: dto.customerId.trim(),
        createdAt: this.clock.now(),
      });

      const normalizedItems = await Promise.all(
        dto.items.map(async (item) => {
          const sku = SKU.create(item.sku);
          const quantity = Quantity.create(item.quantity);
          const unitPrice = await this.pricingService.quote(sku);
          return OrderItem.create({ sku, quantity, unitPrice });
        }),
      );

      normalizedItems.forEach((item) =>
        order.addItem({
          sku: item.sku,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        }),
      );

      await this.repository.save(order);
      await this.eventBus.publish(order.pullDomainEvents());

      console.log(
        `[orders] Created order ${order.id} for customer ${order.customerId} with ${order.itemsList().length} items`,
      );

      return ok({ orderId: order.id });
    } catch (error) {
      return fail(toAppError(error));
    }
  }

  private validate(dto: CreateOrderDTO): ValidationError | null {
    if (!dto.orderId || !dto.orderId.trim()) {
      return new ValidationError('orderId is required');
    }

    if (!dto.customerId || !dto.customerId.trim()) {
      return new ValidationError('customerId is required');
    }

    if (!Array.isArray(dto.items) || dto.items.length === 0) {
      return new ValidationError('At least one item is required');
    }

    for (const item of dto.items) {
      if (!SKU.isValid(item.sku)) {
        return new ValidationError(`Invalid SKU ${item.sku}`);
      }

      if (!Quantity.isValid(item.quantity)) {
        return new ValidationError(
          `Invalid quantity for SKU ${item.sku}`,
        );
      }
    }

    return null;
  }
}
