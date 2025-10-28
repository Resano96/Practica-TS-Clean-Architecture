import { randomUUID } from 'node:crypto';
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

      const requestedOrderId = dto.orderId?.trim();
      let orderId = requestedOrderId && requestedOrderId.length > 0
        ? requestedOrderId
        : await this.generateUniqueOrderId();

      if (requestedOrderId) {
        const existing = await this.repository.findById(orderId);
        if (existing) {
          return fail(new ConflictError('Order already exists'));
        }
      } else {
        orderId = await this.ensureUnique(orderId);
      }

      const order = Order.create({
        id: orderId,
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

  private async generateUniqueOrderId(): Promise<string> {
    return this.ensureUnique(this.generateCandidateId());
  }

  private generateCandidateId(): string {
    return randomUUID();
  }

  private async ensureUnique(candidate: string): Promise<string> {
    let orderId = candidate;

    for (let attempt = 0; attempt < 5; attempt++) {
      const existing = await this.repository.findById(orderId);
      if (!existing) {
        return orderId;
      }
      orderId = this.generateCandidateId();
    }

    throw new ConflictError('Unable to generate a unique order id');
  }
}
