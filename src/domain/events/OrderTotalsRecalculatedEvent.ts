import { DomainEvent } from './DomainEvent';

export class OrderTotalsRecalculatedEvent implements DomainEvent {
  readonly name = 'order.totals_recalculated';
  readonly occurredOn: Date;

  constructor(
    public readonly orderId: string,
    public readonly totalsByCurrency: Record<string, number>,
    occurredOn?: Date,
  ) {
    this.occurredOn = occurredOn ?? new Date();
  }
}
