import { OrderRepository } from './OrderRepository';
export interface UnitOfWorkRepositories {
    orders: OrderRepository;
}
export interface UnitOfWork {
    run<T>(handler: (repos: UnitOfWorkRepositories) => Promise<T>): Promise<T>;
}
