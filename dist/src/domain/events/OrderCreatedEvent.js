export class OrderCreatedEvent {
    orderId;
    customerId;
    name = 'order.created';
    occurredOn;
    constructor(orderId, customerId, occurredOn) {
        this.orderId = orderId;
        this.customerId = customerId;
        this.occurredOn = occurredOn ?? new Date();
    }
}
//# sourceMappingURL=OrderCreatedEvent.js.map