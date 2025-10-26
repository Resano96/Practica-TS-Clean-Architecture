import { Quantity } from '../../domain/value-objects/Quantity';
import { SKU } from '../../domain/value-objects/SKU';
import { fail, ok, Result } from '../../shared/Result';
import {
  AppError,
  NotFoundError,
  ValidationError,
  toAppError,
} from '../errors';
import { AddItemToOrderDTO } from '../dto/AddItemToOrderDTO';
import { EventBus } from '../ports/EventBus';
import { OrderRepository } from '../ports/OrderRepository';
import { PricingService } from '../ports/PricingService';

type AddItemToOrderResult = Result<{ orderId: string }, AppError>;

export class AddItemToOrder {
  constructor(
    private readonly repository: OrderRepository,
    private readonly pricingService: PricingService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(dto: AddItemToOrderDTO): Promise<AddItemToOrderResult> {
    try {
      const validationError = this.validate(dto);
      if (validationError) {
        return fail(validationError);
      }

      const order = await this.repository.findById(dto.orderId.trim());
      if (!order) {
        return fail(new NotFoundError('Order not found'));
      }

      const sku = SKU.create(dto.sku);
      const quantity = Quantity.create(dto.quantity);
      const unitPrice = await this.pricingService.quote(sku);

      order.addItem({ sku, quantity, unitPrice });

      await this.repository.save(order);
      await this.eventBus.publish(order.pullDomainEvents());

      console.log(
        `[orders] Added ${quantity.value} x ${sku.value} to order ${order.id}`,
      );

      return ok({ orderId: order.id });
    } catch (error) {
      return fail(toAppError(error));
    }
  }

  private validate(dto: AddItemToOrderDTO): ValidationError | null {
    if (!dto.orderId || !dto.orderId.trim()) {
      return new ValidationError('orderId is required');
    }

    if (!SKU.isValid(dto.sku)) {
      return new ValidationError('Invalid SKU');
    }

    if (!Quantity.isValid(dto.quantity)) {
      return new ValidationError('Invalid quantity');
    }

    return null;
  }
}
