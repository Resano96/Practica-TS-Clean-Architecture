import { Result } from '../../shared/Result';
import { AppError } from '../errors';
import { CreateOrderDTO } from '../dto/CreateOrderDTO';
import { Clock } from '../ports/Clock';
import { EventBus } from '../ports/EventBus';
import { OrderRepository } from '../ports/OrderRepository';
import { PricingService } from '../ports/PricingService';
type CreateOrderResult = Result<{
    orderId: string;
}, AppError>;
export declare class CreateOrder {
    private readonly repository;
    private readonly pricingService;
    private readonly eventBus;
    private readonly clock;
    constructor(repository: OrderRepository, pricingService: PricingService, eventBus: EventBus, clock: Clock);
    execute(dto: CreateOrderDTO): Promise<CreateOrderResult>;
    private validate;
    private generateUniqueOrderId;
    private generateCandidateId;
    private ensureUnique;
}
export {};
