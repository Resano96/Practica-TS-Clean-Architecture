import fastify, { FastifyInstance } from 'fastify';
import { buildContainer, Container } from '../../composition/container';
import { OrdersController } from './controllers/OrdersController';

export const buildServer = ({
  container = buildContainer(),
}: { container?: Container } = {}): FastifyInstance => {
  const app = fastify();

  app.get('/health', async () => {
    try {
      await container.orderRepository.findById('__health_check__');
      return { status: 'ok' };
    } catch (error) {
      return {
        status: 'error',
        reason:
          error instanceof Error ? error.message : 'Unknown health check failure',
      };
    }
  });

  app.get('/orders', async () => ({
    tutorial: [
      'Command to make an order:',
      'Invoke-RestMethod -Uri http://localhost:3000/orders -Method Post -ContentType "application/json" -Body (@{ orderId = "ORDER-001"; customerId = "C-123"; items = @(@{ sku = "SKU-ABC"; quantity = 2 }, @{ sku = "SKU-XYZ"; quantity = 1 }) } | ConvertTo-Json -Depth 5)',
      'Command to add an item to an order:',
      'Invoke-RestMethod -Uri http://localhost:3000/orders/ORDER-001/items -Method Post -ContentType "application/json" -Body (@{ sku = "SKU-ABC"; quantity = 1 } | ConvertTo-Json)',
    ],
  }));

  const controller = new OrdersController({
    createOrder: container.createOrder,
    addItemToOrder: container.addItemToOrder,
  });
  controller.registerRoutes(app);

  return app;
};
