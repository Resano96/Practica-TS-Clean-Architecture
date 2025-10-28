import { Result } from '../../shared/Result';
import { AppError } from '../errors';
import { AddItemToOrderDTO } from '../dto/AddItemToOrderDTO';
import { EventBus } from '../ports/EventBus';
import { OrderRepository } from '../ports/OrderRepository';
import { PricingService } from '../ports/PricingService';
type AddItemToOrderResult = Result<{
    orderId: string;
}, AppError>;
export declare class AddItemToOrder {
    private readonly repository;
    private readonly pricingService;
    private readonly eventBus;
    constructor(repository: OrderRepository, pricingService: PricingService, eventBus: EventBus);
    execute(dto: AddItemToOrderDTO): Promise<AddItemToOrderResult>;
    private validate;
}
export {};
