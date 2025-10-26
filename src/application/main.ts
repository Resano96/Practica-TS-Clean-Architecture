import { buildContainer } from '../composition/container';
import { buildServer } from '../infrastructure/http/server';

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? '0.0.0.0';

async function main(): Promise<void> {
  const container = buildContainer();
  const app = buildServer({ container });

  try {
    await app.listen({ port, host });
    const boundAddress = `http://${host}:${port}`;
    const localAddress =
      host === '0.0.0.0' || host === '::'
        ? `http://localhost:${port}`
        : boundAddress;

    console.log(`🚀 Fastify listening on ${boundAddress}`);
    if (localAddress !== boundAddress) {
      console.log(`🔗 Local access via ${localAddress}`);
    }
    console.log(`💓 Health check: ${localAddress}/health`);
    console.log(`📦 Orders API: ${localAddress}/orders`);
    console.log('🛑 Press Ctrl+C to stop the server');
  } catch (error) {
    console.error('Failed to start Fastify server', error);
    process.exit(1);
  }
}

main();
