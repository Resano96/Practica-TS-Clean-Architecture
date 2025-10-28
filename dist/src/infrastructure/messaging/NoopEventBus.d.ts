import { DomainEvent } from '../../domain/events/DomainEvent';
import { EventBus } from '../../application/ports/EventBus';
export declare class NoopEventBus implements EventBus {
    publish(events: DomainEvent[]): Promise<void>;
}
