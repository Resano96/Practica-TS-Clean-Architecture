import { Quantity } from '../../domain/value-objects/Quantity';
import { SKU } from '../../domain/value-objects/SKU';
import { fail, ok } from '../../shared/Result';
import { NotFoundError, ValidationError, toAppError, } from '../errors';
export class AddItemToOrder {
    repository;
    pricingService;
    eventBus;
    constructor(repository, pricingService, eventBus) {
        this.repository = repository;
        this.pricingService = pricingService;
        this.eventBus = eventBus;
    }
    async execute(dto) {
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
            console.log(`[orders] Added ${quantity.value} x ${sku.value} to order ${order.id}`);
            return ok({ orderId: order.id });
        }
        catch (error) {
            return fail(toAppError(error));
        }
    }
    validate(dto) {
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
//# sourceMappingURL=AddItemToOrder.js.map