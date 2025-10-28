import { OrderRepository } from './OrderRepository';

export interface UnitOfWorkRepositories {
  orders: OrderRepository;
  // Add new repositories here as the application grows.
}

export interface UnitOfWork {
  run<T>(handler: (repos: UnitOfWorkRepositories) => Promise<T>): Promise<T>;
}
