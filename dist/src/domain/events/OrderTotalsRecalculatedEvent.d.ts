import { DomainEvent } from './DomainEvent';
export declare class OrderTotalsRecalculatedEvent implements DomainEvent {
    readonly orderId: string;
    readonly totalsByCurrency: Record<string, number>;
    readonly name = "order.totals_recalculated";
    readonly occurredOn: Date;
    constructor(orderId: string, totalsByCurrency: Record<string, number>, occurredOn?: Date);
}
