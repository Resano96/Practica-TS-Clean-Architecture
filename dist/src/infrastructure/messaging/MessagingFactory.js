import { OutboxEventBus } from './OutboxEventBus';
import { NoopEventBus } from './NoopEventBus';
import { OutboxDispatcher, } from './OutboxDispatcher';
import { createPool, closePool } from '../database/DatabaseFactory';
export class MessagingFactory {
    options;
    pool = null;
    dispatcher = null;
    constructor(options = {}) {
        this.options = options;
    }
    createEventBus() {
        if (!this.options.useOutbox) {
            return new NoopEventBus();
        }
        this.ensurePool();
        return new OutboxEventBus(this.pool);
    }
    startDispatcher(processor) {
        if (!this.options.useOutbox) {
            return;
        }
        this.ensurePool();
        if (!this.dispatcher) {
            this.dispatcher = new OutboxDispatcher(this.pool, processor, this.options.dispatcherOptions);
            this.dispatcher.start();
        }
    }
    async stop() {
        if (this.dispatcher) {
            this.dispatcher.stop();
            this.dispatcher = null;
        }
        if (this.pool) {
            await closePool(this.pool);
            this.pool = null;
        }
    }
    ensurePool() {
        if (!this.pool) {
            this.pool = createPool();
        }
    }
}
//# sourceMappingURL=MessagingFactory.js.map