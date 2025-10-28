import { Order } from '../../../domain/entities/Order';
import { OrderRepository } from '../../../application/ports/OrderRepository';
export declare class InMemoryOrderRepository implements OrderRepository {
    private readonly orders;
    constructor(seed?: Order[]);
    save(order: Order): Promise<void>;
    findById(id: string): Promise<Order | null>;
    getAll(): Order[];
}
