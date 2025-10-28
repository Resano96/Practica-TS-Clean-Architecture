export class InMemoryOrderRepository {
    orders;
    constructor(seed = []) {
        this.orders = new Map(seed.map((order) => [order.id, order]));
    }
    async save(order) {
        this.orders.set(order.id, order);
    }
    async findById(id) {
        return this.orders.get(id) ?? null;
    }
    // Testing helper to inspect stored orders without exposing the map.
    getAll() {
        return Array.from(this.orders.values());
    }
}
//# sourceMappingURL=InMemoryOrderRepository.js.map