import { Order } from '../../../domain/entities/Order';
import { OrderRepository } from '../../../application/ports/OrderRepository';

export class InMemoryOrderRepository implements OrderRepository {
  private readonly orders: Map<string, Order>;

  constructor(seed: Order[] = []) {
    this.orders = new Map(seed.map((order) => [order.id, order]));
  }

  async save(order: Order): Promise<void> {
    this.orders.set(order.id, order);
  }

  async findById(id: string): Promise<Order | null> {
    return this.orders.get(id) ?? null;
  }

  // Testing helper to inspect stored orders without exposing the map.
  getAll(): Order[] {
    return Array.from(this.orders.values());
  }
}
