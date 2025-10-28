import { OrderCreatedEvent } from '../events/OrderCreatedEvent';
import { OrderItemAddedEvent } from '../events/OrderItemAddedEvent';
import { OrderTotalsRecalculatedEvent } from '../events/OrderTotalsRecalculatedEvent';
import { OrderItem } from '../value-objects/OrderItem';
const INVALID_ORDER_ID_MESSAGE = 'Order id must be a non-empty string';
const INVALID_CUSTOMER_ID_MESSAGE = 'Customer id must be a non-empty string';
export class Order {
    props;
    items;
    domainEvents = [];
    constructor(props) {
        this.props = props;
        this.items = new Map((props.items ?? []).map((item) => [item.sku.value, item]));
    }
    static create(params) {
        Order.ensureId(params.id);
        Order.ensureCustomerId(params.customerId);
        const order = new Order({
            id: params.id,
            customerId: params.customerId,
            items: params.items ?? [],
            createdAt: params.createdAt,
        });
        order.record(new OrderCreatedEvent(params.id, params.customerId, params.createdAt));
        order.recalculateTotals();
        return order;
    }
    get id() {
        return this.props.id;
    }
    get customerId() {
        return this.props.customerId;
    }
    get createdAt() {
        return this.props.createdAt;
    }
    addItem(params) {
        const key = params.sku.value;
        const existing = this.items.get(key);
        const nextItem = existing
            ? existing.addQuantity(params.quantity)
            : OrderItem.create({
                sku: params.sku,
                unitPrice: params.unitPrice,
                quantity: params.quantity,
            });
        this.items.set(key, nextItem);
        this.record(new OrderItemAddedEvent(this.props.id, params.sku, params.quantity, params.unitPrice));
        this.recalculateTotals();
    }
    itemsList() {
        return Array.from(this.items.values());
    }
    totalsByCurrency() {
        return new Map(Object.entries(this.computeTotals()));
    }
    pullDomainEvents() {
        const events = [...this.domainEvents];
        this.domainEvents.length = 0;
        return events;
    }
    recalculateTotals() {
        const totals = this.computeTotals();
        this.record(new OrderTotalsRecalculatedEvent(this.props.id, totals));
    }
    computeTotals() {
        const totals = {};
        for (const item of this.items.values()) {
            const total = item.total();
            const currency = total.currency.code;
            totals[currency] = Number(((totals[currency] ?? 0) + total.amount).toFixed(2));
        }
        return totals;
    }
    record(event) {
        this.domainEvents.push(event);
    }
    static ensureId(value) {
        if (!value || typeof value !== 'string' || !value.trim()) {
            throw new Error(INVALID_ORDER_ID_MESSAGE);
        }
    }
    static ensureCustomerId(value) {
        if (!value || typeof value !== 'string' || !value.trim()) {
            throw new Error(INVALID_CUSTOMER_ID_MESSAGE);
        }
    }
}
//# sourceMappingURL=Order.js.map