import { DomainEvent } from '../../domain/events/DomainEvent';
import { EventBus } from '../../application/ports/EventBus';

export class NoopEventBus implements EventBus {
  async publish(events: DomainEvent[]): Promise<void> {
    // Intentionally left blank for testing/scenarios without messaging.
    void events;
  }
}
