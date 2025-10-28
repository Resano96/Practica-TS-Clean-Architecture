export class OrderTotalsRecalculatedEvent {
    orderId;
    totalsByCurrency;
    name = 'order.totals_recalculated';
    occurredOn;
    constructor(orderId, totalsByCurrency, occurredOn) {
        this.orderId = orderId;
        this.totalsByCurrency = totalsByCurrency;
        this.occurredOn = occurredOn ?? new Date();
    }
}
//# sourceMappingURL=OrderTotalsRecalculatedEvent.js.map