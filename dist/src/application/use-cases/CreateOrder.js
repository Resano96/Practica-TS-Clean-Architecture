import { randomUUID } from 'node:crypto';
import { Order } from '../../domain/entities/Order';
import { OrderItem } from '../../domain/value-objects/OrderItem';
import { Quantity } from '../../domain/value-objects/Quantity';
import { SKU } from '../../domain/value-objects/SKU';
import { fail, ok } from '../../shared/Result';
import { ConflictError, ValidationError, toAppError, } from '../errors';
export class CreateOrder {
    repository;
    pricingService;
    eventBus;
    clock;
    constructor(repository, pricingService, eventBus, clock) {
        this.repository = repository;
        this.pricingService = pricingService;
        this.eventBus = eventBus;
        this.clock = clock;
    }
    async execute(dto) {
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
            }
            else {
                orderId = await this.ensureUnique(orderId);
            }
            const order = Order.create({
                id: orderId,
                customerId: dto.customerId.trim(),
                createdAt: this.clock.now(),
            });
            const normalizedItems = await Promise.all(dto.items.map(async (item) => {
                const sku = SKU.create(item.sku);
                const quantity = Quantity.create(item.quantity);
                const unitPrice = await this.pricingService.quote(sku);
                return OrderItem.create({ sku, quantity, unitPrice });
            }));
            normalizedItems.forEach((item) => order.addItem({
                sku: item.sku,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
            }));
            await this.repository.save(order);
            await this.eventBus.publish(order.pullDomainEvents());
            console.log(`[orders] Created order ${order.id} for customer ${order.customerId} with ${order.itemsList().length} items`);
            return ok({ orderId: order.id });
        }
        catch (error) {
            return fail(toAppError(error));
        }
    }
    validate(dto) {
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
                return new ValidationError(`Invalid quantity for SKU ${item.sku}`);
            }
        }
        return null;
    }
    async generateUniqueOrderId() {
        return this.ensureUnique(this.generateCandidateId());
    }
    generateCandidateId() {
        return randomUUID();
    }
    async ensureUnique(candidate) {
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
//# sourceMappingURL=CreateOrder.js.map