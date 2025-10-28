import { buildContainer } from "../composition/container";
import { buildServer } from "../infrastructure/http/server";
const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? "0.0.0.0";
async function main() {
    const container = buildContainer();
    const app = buildServer({ container });
    let shuttingDown = false;
    const shutdown = async (signal) => {
        if (shuttingDown) {
            return;
        }
        shuttingDown = true;
        console.log(`Received ${signal}. Shutting down gracefully...`);
        try {
            await app.close();
            console.log("Fastify server closed");
        }
        catch (error) {
            console.error("Error while closing Fastify server", error);
        }
        try {
            await container.shutdown();
        }
        catch (error) {
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
        await app.listen({ port, host });
        const boundAddress = `http://${host}:${port}`;
        const localAddress = host === "0.0.0.0" || host === "::"
            ? `http://localhost:${port}`
            : boundAddress;
        console.log(`Fastify listening on ${boundAddress}`);
        if (localAddress !== boundAddress) {
            console.log(`Local access via ${localAddress}`);
        }
        console.log(`Health check: ${localAddress}/health`);
        console.log(`Orders API: ${localAddress}/orders`);
        console.log("Press Ctrl+C to stop the server");
    }
    catch (error) {
        console.error("Failed to start Fastify server", error);
        await container.shutdown();
        process.exit(1);
    }
}
main();
//# sourceMappingURL=main.js.map