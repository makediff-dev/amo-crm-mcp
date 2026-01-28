import { config as loadEnvFile } from 'dotenv';
import { z, ZodSchema } from 'zod';
import { resolve } from 'path';

/**
 * Load .env file silently (without breaking stdio transport by console output)
 * Tries multiple locations: current working directory, project root (relative to dist)
 */
export function loadDotenvSilent(): void {
  const originalLog = console.log;
  const originalWarn = console.warn;
  console.log = () => {};
  console.warn = () => {};

  // Try current working directory first (for Cursor MCP with cwd set)
  const cwdResult = loadEnvFile({ path: resolve(process.cwd(), '.env') });

  // If not found or empty, try project root (assuming we're in dist/lib/utils)
  // Go up from dist/lib/utils to project root: ../../../
  if (!cwdResult.parsed || Object.keys(cwdResult.parsed).length === 0) {
    // Calculate project root relative to dist folder
    // When running from dist/index.js, __dirname will be dist/
    // So we need to go up one level to get project root
    const distDir = __dirname.replace(/[/\\]lib[/\\]utils$/, '');
    const projectRoot = resolve(distDir, '..');
    loadEnvFile({ path: resolve(projectRoot, '.env') });
  }

  console.log = originalLog;
  console.warn = originalWarn;
}

/**
 * Parse and validate environment variables with Zod schema
 */
export function parseEnv<T extends ZodSchema>(schema: T): z.infer<T> {
  const result = schema.safeParse(process.env);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new Error(`Invalid environment configuration: ${issues}`);
  }
  return result.data;
}

/**
 * Base environment schema for common fields
 */
export const baseEnvSchema = z.object({
  LOG_LEVEL: z.string().optional(),
  LOG_FILE_PATH: z.string().optional(),
});

export type BaseEnv = z.infer<typeof baseEnvSchema>;
