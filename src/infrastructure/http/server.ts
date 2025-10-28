import fastify, { FastifyInstance } from 'fastify';
import { buildContainer, Container } from '../../composition/container';
import { OrdersController } from './controllers/OrdersController';

const HEALTH_CHECK_PROBE_ID = '00000000-0000-0000-0000-000000000000';

export const buildServer = ({
  container = buildContainer(),
}: { container?: Container } = {}): FastifyInstance => {
  const app = fastify();
  const { logger } = container;
  const port = Number(process.env.PORT ?? 3000);
  const baseUrl = `http://localhost:${port}`;

  app.addHook('onResponse', async (request, reply) => {
    if (request.method === 'POST') {
      logger.info('Processed POST request', {
        url: request.url,
        statusCode: reply.statusCode,
      });
    }
  });

  app.get('/', async () => ({
    message: 'Orders service ready',
    endpoints: {
      health: `${baseUrl}/health`,
      orders: `${baseUrl}/orders`,
      orderCreation: `${baseUrl}/orders`,
      addItem: `${baseUrl}/orders/{orderId}/items`,
    },
  }));

  app.get('/health', async () => {
    try {
      await container.orderRepository.findById(HEALTH_CHECK_PROBE_ID);
      logger.info('Health check succeeded');
      return { status: 'ok' };
    } catch (error) {
      logger.error('Health check failed', {
        error:
          error instanceof Error ? error.message : 'Unknown health check failure',
      });
      return {
        status: 'error',
        reason:
          error instanceof Error ? error.message : 'Unknown health check failure',
      };
    }
  });

  app.get('/orders', async () => ({
    tutorial: [
      'PowerShell - crear un pedido:',
      `$body = @{` +
        ` customerId = "CUSTOMER-123";` +
        ` items = @(` +
        ` @{ sku = "SKU-ABC"; quantity = 2 },` +
        ` @{ sku = "SKU-XYZ"; quantity = 1 }` +
        ` )` +
        ` } | ConvertTo-Json\n` +
        `Invoke-RestMethod -Method Post -Uri "${baseUrl}/orders" -ContentType "application/json" -Body $body`,
      'PowerShell - añadir un artículo a un pedido existente:',
      `$body = @{ sku = "SKU-ABC"; quantity = 1 } | ConvertTo-Json\n` +
        `Invoke-RestMethod -Method Post -Uri "${baseUrl}/orders/<ID_DEL_PEDIDO>/items" -ContentType "application/json" -Body $body`,
    ],
  }));

  const controller = new OrdersController({
    createOrder: container.createOrder,
    addItemToOrder: container.addItemToOrder,
    logger,
  });
  controller.registerRoutes(app);

  return app;
};
