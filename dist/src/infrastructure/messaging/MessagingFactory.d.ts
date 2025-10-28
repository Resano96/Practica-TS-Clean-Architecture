import { EventBus } from '@application/ports/EventBus';
import { OutboxDispatcherOptions, OutboxProcessor } from './OutboxDispatcher';
export interface MessagingFactoryOptions {
    useOutbox?: boolean;
    dispatcherOptions?: OutboxDispatcherOptions;
}
export declare class MessagingFactory {
    private readonly options;
    private pool;
    private dispatcher;
    constructor(options?: MessagingFactoryOptions);
    createEventBus(): EventBus;
    startDispatcher(processor: OutboxProcessor): void;
    stop(): Promise<void>;
    private ensurePool;
}
