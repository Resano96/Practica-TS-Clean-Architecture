import { createServer } from "node:net";
import { buildContainer } from "../composition/container";
import { buildServer } from "../infrastructure/http/server";

const requestedPort = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? "0.0.0.0";
const allowPortFallback =
  (process.env.PORT_FALLBACK ?? "true").trim().toLowerCase() !== "false";
const portFallbackAttempts = Math.max(
  0,
  Number.isNaN(Number(process.env.PORT_FALLBACK_ATTEMPTS))
    ? 5
    : Number(process.env.PORT_FALLBACK_ATTEMPTS),
);

async function main(): Promise<void> {
  const container = buildContainer();
  const app = buildServer({ container });

  let shuttingDown = false;

  const shutdown = async (signal: string): Promise<void> => {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;
    console.log(`Received ${signal}. Shutting down gracefully...`);

    try {
      await app.close();
      console.log("Fastify server closed");
    } catch (error) {
      console.error("Error while closing Fastify server", error);
    }

    try {
      await container.shutdown();
    } catch (error) {
      console.error("Error while closing container resources", error);
    }

    process.exit(0);
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));

  app.addHook("onClose", async () => {
    await container.shutdown();
  });

  try {
    const port = await listenWithFallback(app, host, requestedPort);
    const boundAddress = `http://${host}:${port}`;
    const localAddress =
      host === "0.0.0.0" || host === "::"
        ? `http://localhost:${port}`
        : boundAddress;

    console.log(`Fastify listening on ${boundAddress}`);
    if (localAddress !== boundAddress) {
      console.log(`Local access via ${localAddress}`);
    }
    console.log(`Health check: ${localAddress}/health`);
    console.log(`Orders API: ${localAddress}/orders`);
    console.log("Press Ctrl+C to stop the server");
  } catch (error) {
    console.error("Failed to start Fastify server", error);
    await container.shutdown();
    process.exit(1);
  }
}

function isAddrInUseError(
  error: unknown,
): error is NodeJS.ErrnoException & { code: "EADDRINUSE" } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "EADDRINUSE"
  );
}

async function listenWithFallback(
  app: ReturnType<typeof buildServer>,
  host: string,
  initialPort: number,
): Promise<number> {
  const triedPorts: number[] = [];
  let port = initialPort;

  for (let attempt = 0; attempt <= portFallbackAttempts; attempt++) {
    triedPorts.push(port);
    try {
      await app.listen({ port, host });
      if (attempt > 0) {
        console.warn(
          `Port ${initialPort} was busy. Server is listening on port ${port} instead.`,
        );
      }
      return port;
    } catch (error) {
      if (!isAddrInUseError(error) || !allowPortFallback) {
        throw error;
      }

      port = await findNextAvailablePort(host, port + 1);
    }
  }

  throw new Error(
    `Unable to find an available port after trying: ${triedPorts.join(", ")}`,
  );
}

async function findNextAvailablePort(host: string, startPort: number) {
  let port = startPort;
  // Try up to 20 consecutive ports to avoid infinite loops.
  for (let attempt = 0; attempt < 20; attempt++) {
    const available = await isPortAvailable(host, port);
    if (available) {
      return port;
    }
    port += 1;
  }
  throw new Error("No free port found in range");
}

function isPortAvailable(host: string, port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const tester = createServer()
      .once("error", (error: NodeJS.ErrnoException) => {
        if (error.code === "EADDRINUSE") {
          resolve(false);
        } else {
          resolve(false);
        }
      })
      .once("listening", () => {
        tester.close(() => resolve(true));
      });

    tester.listen(port, host);
  });
}

main();
