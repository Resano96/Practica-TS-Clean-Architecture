import { z } from 'zod';
import dotenv from 'dotenv';
// Load environment variables
dotenv.config();
// Define the schema for environment variables
const envSchema = z.object({
    PORT: z.coerce.number().default(3000),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    DATABASE_URL: z.string().url(),
    JWT_SECRET: z.string().min(1).default('dev-secret'),
});
// Validate and parse environment variables
const validateConfig = () => {
    try {
        return envSchema.parse({
            PORT: process.env.PORT,
            NODE_ENV: process.env.NODE_ENV,
            DATABASE_URL: process.env.DATABASE_URL,
            JWT_SECRET: process.env.JWT_SECRET,
        });
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            throw new Error(`Environment validation failed: ${JSON.stringify(error.errors, null, 2)}`);
        }
        throw error;
    }
};
// Export the validated config
export const config = validateConfig();
//# sourceMappingURL=config.js.map