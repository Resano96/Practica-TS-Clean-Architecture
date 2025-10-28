import { DomainEvent } from './DomainEvent';
export declare class OrderCreatedEvent implements DomainEvent {
    readonly orderId: string;
    readonly customerId: string;
    readonly name = "order.created";
    readonly occurredOn: Date;
    constructor(orderId: string, customerId: string, occurredOn?: Date);
}
