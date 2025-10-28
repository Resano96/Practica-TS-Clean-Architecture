export class OrderItemAddedEvent {
    orderId;
    sku;
    quantity;
    unitPrice;
    name = 'order.item_added';
    occurredOn;
    constructor(orderId, sku, quantity, unitPrice, occurredOn) {
        this.orderId = orderId;
        this.sku = sku;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.occurredOn = occurredOn ?? new Date();
    }
}
//# sourceMappingURL=OrderItemAddedEvent.js.map