import { DomainEvent } from './DomainEvent';

export class OrderCreatedEvent implements DomainEvent {
  readonly name = 'order.created';
  readonly occurredOn: Date;

  constructor(
    public readonly orderId: string,
    public readonly customerId: string,
    occurredOn?: Date,
  ) {
    this.occurredOn = occurredOn ?? new Date();
  }
}
